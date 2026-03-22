import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { itemId, senderId, receiverId, content } = await req.json()

    if (!itemId || !senderId || !receiverId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 0. Validate Environment Variables
    const isPlaceholderResend = process.env.RESEND_API_KEY === 're_your_api_key_here'
    if (isPlaceholderResend || !process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 })
    }

    // 1. Fetch Data (Item, Sender, Receiver)
    const [itemRes, senderRes, receiverRes] = await Promise.all([
      supabase.from('items').select('title').eq('id', itemId).single(),
      supabase.from('profiles').select('full_name, email').eq('id', senderId).single(),
      supabase.from('profiles').select('full_name, email').eq('id', receiverId).single()
    ])

    if (itemRes.error || !itemRes.data) throw new Error('Item not found')
    if (senderRes.error || !senderRes.data) throw new Error('Sender not found')
    if (receiverRes.error || !receiverRes.data) throw new Error('Receiver not found')

    const itemTitle = itemRes.data.title
    const senderName = senderRes.data.full_name || senderRes.data.email.split('@')[0]
    const receiverEmail = receiverRes.data.email
    const receiverName = receiverRes.data.full_name || receiverEmail.split('@')[0]

    // 2. Send Email
    await resend.emails.send({
      from: 'Lost & Found <noreply@resend.dev>',
      to: receiverEmail,
      subject: `New Message regarding "${itemTitle}"`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #6366f1;">Hello ${receiverName},</h2>
          <p><strong>${senderName}</strong> sent you a message regarding your item: <strong>${itemTitle}</strong>.</p>
          <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
            <p style="margin: 0; font-style: italic;">"${content}"</p>
          </div>
          <div style="margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/item/${itemId}" 
               style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              View Conversation & Reply
            </a>
          </div>
          <p style="margin-top: 30px; font-size: 14px; color: #666;">
            Lost & Found Community
          </p>
        </div>
      `
    })

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Message Notify Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
