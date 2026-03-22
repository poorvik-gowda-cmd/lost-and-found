'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Mail, Bell, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { ProfileAvatar } from './ProfileAvatar'
import { ProfileName } from './ProfileName'

export function Navbar() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [messageCount, setMessageCount] = useState(0)
  const [isClient, setIsClient] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    setIsClient(true)

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        checkOrCreateProfile(user)
        fetchMessageCount(user.id)
      }
    }
    getUser()

    const fetchMessageCount = async (userId: string) => {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('to_user_id', userId)
      
      if (!error && count !== null) {
        setMessageCount(count)
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const newUser = session?.user ?? null
        setUser(newUser)
        if (newUser) {
          checkOrCreateProfile(newUser)
          fetchMessageCount(newUser.id)
        } else {
          setMessageCount(0)
        }
      }
    )

    const checkOrCreateProfile = async (user: User) => {
      // Check if profile exists and if name is missing
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('id', user.id)
        .single()

      const metadataName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'

      if (error || !profile) {
        console.log("Profile not found, creating one for user:", user.id)
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: metadataName,
            avatar_url: user.user_metadata?.avatar_url || null
          })
        if (insertError) console.error("Error creating profile:", insertError.message)
      } else if (!profile.full_name || profile.full_name === 'User') {
        // Update existing profile if name is missing or generic
        console.log("Profile exists but name is missing, updating...")
        await supabase
          .from('profiles')
          .update({ full_name: metadataName })
          .eq('id', user.id)
      }
    }

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-white/20">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Search className="h-6 w-6 text-indigo-500" />
          <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
            Lost & Found
          </span>
        </Link>
        
        <div className="flex items-center space-x-4">
          <Link href="/post">
             <Button variant={pathname === '/post' ? 'default' : 'ghost'} className="rounded-full gap-2">
               <Bell className="w-4 h-4" />
               Post Item
             </Button>
          </Link>
          
          {user ? (
             <div className="flex items-center space-x-6">
               <div className="relative group cursor-pointer">
                 <MessageSquare className="w-6 h-6 text-white/70 hover:text-white transition-colors" />
                 {messageCount > 0 && (
                   <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border-2 border-[#1a1c2c]">
                     {messageCount}
                   </span>
                 )}
               </div>
                              <div className="flex items-center space-x-3">
                  <div className="flex flex-col items-end">
                    <ProfileName userId={user.id} className="text-white text-sm font-medium" />
                    <span className="text-[10px] text-white/40">{user.email}</span>
                  </div>
                  <ProfileAvatar userId={user.id} className="h-9 w-9 border border-white/10" />
                  <Button variant="ghost" className="rounded-full text-white/70 hover:text-white" onClick={handleSignOut}>
                    Sign Out
                  </Button>
                </div>
             </div>
          ) : (
            <Link href="/login">
              <Button className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white px-8">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
