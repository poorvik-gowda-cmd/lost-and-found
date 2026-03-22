import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Tag, Info, Clock, User, ShieldCheck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { ProfileAvatar } from '@/components/ProfileAvatar'
import { ProfileName } from '@/components/ProfileName'
import { ResilientImage } from '@/components/ResilientImage'
import { MessageSection } from '@/components/MessageSection'
import { MatchingItems } from '@/components/MatchingItems'
import { ClaimButton } from '@/components/ClaimButton'

export const dynamic = 'force-dynamic'

export default async function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Try fetching with profiles join first
  let { data: item, error } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .single()

  // 2. Fallback: If join fails, fetch item only
  if (error) {
    console.warn("Retrying fetch without profiles join due to error:", error.message || error)
    const { data: fallbackItem, error: fallbackError } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .single()

    if (fallbackError || !fallbackItem) {
      console.error("Critical Supabase Error (Item only):", fallbackError)
      notFound()
    }
    item = fallbackItem
  }

  const { data: { user: currentUser } } = await supabase.auth.getUser()
  const isOwner = currentUser?.id === item.user_id

  const date = new Date(item.created_at).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="container mx-auto px-4 py-12 pb-32 max-w-7xl animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Image and Matching (8 cols) */}
        <div className="lg:col-span-8 space-y-12">
          <div className="relative rounded-[2.5rem] overflow-hidden glass-dark border-white/10 aspect-[16/10] shadow-2xl group">
            {item.image_url ? (
              <ResilientImage
                src={item.image_url}
                alt={item.title}
                fill
                unoptimized
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
            ) : (
               <div className="absolute inset-0 bg-white/5 flex flex-col items-center justify-center text-white/20">
                  <Image src="/no-image.svg" alt="No image" width={120} height={120} className="opacity-10 mb-6" />
                  <p className="text-xl font-medium">No image provided</p>
               </div>
            )}
            
            <div className="absolute top-8 left-8 flex gap-3">
              <Badge 
                className={`${item.type === 'lost' ? 'bg-rose-500/90' : 'bg-emerald-500/90'} text-white border-0 text-lg px-6 py-2 backdrop-blur-xl shadow-xl shadow-black/20`}
              >
                {item.type.toUpperCase()}
              </Badge>
              {item.status !== 'open' && (
                <Badge className="bg-amber-500/90 text-black border-0 text-lg px-6 py-2 backdrop-blur-xl shadow-xl shadow-black/20 font-bold">
                  {item.status.toUpperCase()}
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-6">
             <div className="flex flex-wrap items-center gap-4 text-white/50 text-sm">
                <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 px-4 py-1.5 flex items-center">
                   <Tag className="w-3.5 h-3.5 mr-2" /> {item.category}
                </Badge>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" /> {date}
                </div>
             </div>
             
             <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tighter">
               {item.title}
             </h1>

             <Card className="glass-dark border-white/5 rounded-[2rem] overflow-hidden">
                <CardContent className="p-8 space-y-8">
                   <div className="flex items-start group">
                     <div className="h-12 w-12 rounded-2xl bg-rose-500/20 flex items-center justify-center mr-6 shrink-0 group-hover:bg-rose-500/30 transition-colors">
                        <MapPin className="w-6 h-6 text-rose-400" />
                     </div>
                     <div>
                       <h3 className="text-white/40 text-sm font-semibold uppercase tracking-widest mb-1">Found at</h3>
                       <p className="text-white text-2xl font-medium">{item.location}</p>
                     </div>
                   </div>
                   
                   <div className="h-px bg-white/5 w-full" />
                   
                   <div className="flex items-start group">
                     <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center mr-6 shrink-0 group-hover:bg-indigo-500/30 transition-colors">
                        <Info className="w-6 h-6 text-indigo-400" />
                     </div>
                     <div>
                       <h3 className="text-white/40 text-sm font-semibold uppercase tracking-widest mb-1">Description</h3>
                       <p className="text-white/80 text-lg leading-relaxed whitespace-pre-wrap max-w-2xl">
                          {item.description || "No additional details provided."}
                       </p>
                     </div>
                   </div>
                </CardContent>
             </Card>
          </div>

          <MatchingItems item={item as any} />
        </div>

        {/* Right Column: Profile & Messaging (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-8">
           {/* Owner Profile Card */}
           <Card className="glass border-white/10 rounded-[2.5rem] overflow-hidden">
              <CardContent className="p-8">
                 <div className="flex items-center gap-5 mb-8">
                    <ProfileAvatar userId={item.user_id} className="h-20 w-20 border-2 border-indigo-500/30" />
                    <div>
                      <h4 className="text-white/50 text-sm font-semibold uppercase tracking-wider mb-1">Posted by</h4>
                      <ProfileName userId={item.user_id} initialName={item.profiles?.full_name} />
                      {isOwner && <Badge className="mt-2 bg-indigo-500/20 text-indigo-400 border-indigo-500/30">It's You</Badge>}
                    </div>
                 </div>

                 {isOwner ? (
                    <div className="space-y-4">
                       <p className="text-white/60 text-sm text-center mb-6">You created this post. You can mark it as resolved once the item is claimed.</p>
                       <ClaimButton itemId={item.id} currentStatus={item.status} />
                    </div>
                 ) : (
                    <div className="space-y-6">
                       <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl flex items-start">
                          <ShieldCheck className="w-5 h-5 text-indigo-400 mr-3 mt-0.5 shrink-0" />
                          <p className="text-indigo-200/70 text-sm">Your communication happens through our secure messaging system. Never share sensitive personal info.</p>
                       </div>
                    </div>
                 )}
              </CardContent>
           </Card>

           {/* Message Section */}
           <MessageSection 
             itemId={item.id} 
             ownerId={item.user_id} 
             currentUserId={currentUser?.id} 
           />
        </div>
      </div>
    </div>
  )
}
