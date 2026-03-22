'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { MapPin, Calendar, User, Image as ImageIcon } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProfileAvatar } from './ProfileAvatar'
import { ProfileName } from './ProfileName'
import { ResilientImage } from './ResilientImage'

export interface Item {
  id: string
  title: string
  description: string
  category: string
  location: string
  type: 'lost' | 'found'
  image_url: string
  status: string
  created_at: string
  user_id: string
  profiles?: {
    full_name: string | null
    avatar_url: string | null
  }
}

interface ItemCardProps {
  item: Item
}

export function ItemCard({ item }: ItemCardProps) {
  const date = new Date(item.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Link href={`/item/${item.id}`}>
        <Card className="overflow-hidden h-full glass-card border-white/10 flex flex-col cursor-pointer group">
          <div className="relative h-56 w-full overflow-hidden bg-black/40">
            {item.image_url ? (
               <ResilientImage
                 src={item.image_url}
                 alt={item.title}
                 fill
                 unoptimized
                 className="object-cover transition-transform duration-500 group-hover:scale-110"
               />
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/10 bg-white/5">
                    <ImageIcon className="w-12 h-12 mb-2" />
                    <span className="text-xs font-medium uppercase tracking-widest opacity-50">No Image</span>
                </div>
            )}
            
            {/* Overlay Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <Badge 
                className={`${item.type === 'lost' ? 'bg-rose-500/90' : 'bg-emerald-500/90'} text-white border-0 backdrop-blur-md px-3 py-1`}
              >
                {item.type.toUpperCase()}
              </Badge>
            </div>
            
            <div className="absolute top-4 right-4">
               <Badge variant="outline" className={`${item.status === 'open' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-amber-500/20 text-amber-300'} border-white/10 backdrop-blur-md`}>
                  {item.status.toUpperCase()}
               </Badge>
            </div>
          </div>
          
          <CardContent className="p-5 flex-grow">
            <h3 className="font-bold text-xl text-white mb-3 line-clamp-1 group-hover:text-indigo-400 transition-colors">
              {item.title}
            </h3>
            
            <div className="space-y-2.5 text-sm text-white/60">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2.5 text-rose-400/80" />
                <span className="line-clamp-1">{item.location}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2.5 text-indigo-400/80" />
                <span>{date}</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="px-5 py-4 border-t border-white/5 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <ProfileAvatar userId={item.user_id} className="h-6 w-6 border border-white/10" />
               <div className="flex flex-col">
                  <span className="text-[10px] text-white/30 uppercase tracking-tighter">Posted By</span>
                  <ProfileName userId={item.user_id} initialName={item.profiles?.full_name} className="text-xs text-white/80 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px]" />
               </div>
            </div>
            <Badge variant="secondary" className="bg-white/5 text-white/40 text-[10px] font-normal uppercase tracking-wider">
               {item.category}
            </Badge>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  )
}
