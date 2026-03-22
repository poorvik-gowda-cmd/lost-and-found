'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ProfileNameProps {
  userId: string
  initialName?: string | null
  className?: string
}

export function ProfileName({ userId, initialName, className }: ProfileNameProps) {
  const [profile, setProfile] = useState<{ full_name: string | null, email: string | null }>({
    full_name: initialName || null,
    email: null
  })
  const supabase = createClient()

  useEffect(() => {
    const fetchProfile = async () => {
      // If we already have a full name, we might not need to fetch, 
      // but let's fetch anyway to get the email fallback
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', userId)
        .single()

      if (!error && data) {
        setProfile({
          full_name: data.full_name,
          email: data.email
        })
      }
    }

    fetchProfile()
  }, [userId, initialName])

  const displayName = profile.full_name || (profile.email ? profile.email.split('@')[0] : 'User')

  return (
    <h3 className={className || "text-white text-2xl font-bold"}>
      {displayName}
    </h3>
  )
}
