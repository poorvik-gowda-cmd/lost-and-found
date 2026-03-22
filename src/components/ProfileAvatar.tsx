'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface ProfileAvatarProps {
  userId: string
  className?: string
}

export function ProfileAvatar({ userId, className }: ProfileAvatarProps) {
  const [profile, setProfile] = useState<{ full_name: string | null; avatar_url: string | null; email: string | null } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, email')
        .eq('id', userId)
        .single()

      if (!error && data) {
        setProfile(data)
      }
    }

    if (userId) {
      fetchProfile()
    }
  }, [userId])

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : (profile?.email ? profile.email[0].toUpperCase() : '?')

  return (
    <Avatar className={className}>
      <AvatarImage src={profile?.avatar_url || ''} />
      <AvatarFallback className="bg-indigo-500/20 text-indigo-400">
        {initials || <User className="h-4 w-4" />}
      </AvatarFallback>
    </Avatar>
  )
}
