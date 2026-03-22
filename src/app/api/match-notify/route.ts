import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for elevated privileges
)

export async function POST(req: Request) {
  try {
    const { item } = await req.json()

    if (!item) {
      return NextResponse.json({ error: 'Item data is required' }, { status: 400 })
    }

    // 0. Validate Environment Variables
    const isPlaceholderResend = process.env.RESEND_API_KEY === 're_your_api_key_here'
    const isPlaceholderService = process.env.SUPABASE_SERVICE_ROLE_KEY === 'your_service_role_key_here'
    
    if (isPlaceholderResend || !process.env.RESEND_API_KEY) {
      return NextResponse.json({ 
        error: 'RESEND_API_KEY is missing or is still a placeholder in .env.local. Please add a real key from resend.com' 
      }, { status: 500 })
    }

    if (isPlaceholderService || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ 
        error: 'SUPABASE_SERVICE_ROLE_KEY is missing or is still a placeholder in .env.local. Please add your service role key from Supabase Dashboard.' 
      }, { status: 500 })
    }

    // 1. Find matching items
    // Opposing type, same category, similar title
    const oppositeType = item.type === 'lost' ? 'found' : 'lost'
    
    // Simple title match using split keywords
    const keywords = item.title.toLowerCase().split(' ').filter((w: string) => w.length > 3)
    let query = supabase
      .from('items')
      .select('*, profiles(email, full_name)')
      .eq('type', oppositeType)
      .eq('category', item.category)
      .neq('user_id', item.user_id) // Don't match own items

    // If we have keywords, try to match any of them in the title
    if (keywords.length > 0) {
      const orCondition = keywords.map((k: string) => `title.ilike.%${k}%`).join(',')
      query = query.or(orCondition)
    }

    const { data: matches, error: matchError } = await query

    if (matchError) {
      console.error('Matching error:', matchError)
      return NextResponse.json({ error: 'Failed to find matches' }, { status: 500 })
    }

    // 2. Notify owners of matched items
    if (matches && matches.length > 0) {
      const notifications = matches.map(async (match: any) => {
        const ownerEmail = match.profiles?.email
        const ownerName = match.profiles?.full_name || 'User'

        if (ownerEmail) {
          try {
            await resend.emails.send({
              from: 'Lost & Found <noreply@resend.dev>', // You might need a verified domain for production
              to: ownerEmail,
              subject: `Possible Match Found for Your ${match.type.toUpperCase()} Item`,
              html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                  <h2 style="color: #6366f1;">Hello ${ownerName},</h2>
                  <p>A possible match has been found for your item: <strong>${match.title}</strong>.</p>
                  <hr style="border: 1px solid #eee; margin: 20px 0;" />
                  <p><strong>Matched Item:</strong> ${item.title}</p>
                  <p><strong>Location:</strong> ${item.location}</p>
                  <p><strong>Category:</strong> ${item.category}</p>
                  <div style="margin-top: 30px;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/item/${item.id}" 
                       style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; rounded: 8px; font-weight: bold;">
                      View Matched Item
                    </a>
                  </div>
                  <p style="margin-top: 30px; font-size: 14px; color: #666;">
                    Visit the app to connect with the person who posted this.
                  </p>
                </div>
              `
            })
          } catch (emailError) {
            console.error(`Failed to send email to ${ownerEmail}:`, emailError)
          }
        }
      })

      await Promise.all(notifications)
    }

    return NextResponse.json({ 
      success: true, 
      matchCount: matches?.length || 0,
      matches: matches
    })

  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
