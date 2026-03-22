'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Send } from 'lucide-react'
import { ProfileAvatar } from './ProfileAvatar'

import { ProfileName } from './ProfileName'

interface Message {
  id: string
  content: string
  from_user_id: string
  created_at: string
}

interface MessageSectionProps {
  itemId: string
  ownerId: string
  currentUserId: string | undefined
}

export function MessageSection({ itemId, ownerId, currentUserId }: MessageSectionProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchMessages()
    
    // Subscribe to new messages
    const channel = supabase
      .channel(`item-messages-${itemId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `item_id=eq.${itemId}`,
        },
        () => {
          fetchMessages()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [itemId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('item_id', itemId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching messages:', error.message)
    } else if (data) {
      setMessages(data as any)
    }
    setLoading(false)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentUserId) return

    console.log('Attempting to send message:', {
      item_id: itemId,
      from_user_id: currentUserId,
      to_user_id: ownerId,
      content: newMessage.trim()
    })

    setSending(true)
    const { error } = await supabase
      .from('messages')
      .insert({
        item_id: itemId,
        from_user_id: currentUserId,
        to_user_id: ownerId,
        content: newMessage.trim(),
      })

    if (error) {
       console.error('SEND ERROR:', error)
       alert(`Send failed: ${error.message}`)
    } else {
      const messageContent = newMessage.trim()
      setNewMessage('')
      fetchMessages() // Refresh immediately

      // Trigger email notification
      try {
        fetch('/api/message-notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            itemId,
            senderId: currentUserId,
            receiverId: ownerId,
            content: messageContent,
          }),
        }).then(res => res.json()).then(result => {
          if (result.error) {
            console.warn('Message Notification skipped:', result.error)
          }
        })
      } catch (notifyErr) {
        console.error('Notification trigger failed:', notifyErr)
      }
    }
    setSending(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[500px] glass-dark rounded-3xl overflow-hidden border border-white/10">
      <div className="bg-white/5 p-4 border-b border-white/10">
        <h3 className="font-semibold text-white flex items-center">
          <Send className="w-4 h-4 mr-2 text-indigo-400" />
          Messages ({messages.length})
        </h3>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-white/30 space-y-2">
             <div className="bg-white/5 p-4 rounded-full">
                <Send className="w-6 h-6" />
             </div>
             <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div 
              key={msg.id || `msg-${index}`} 
              className={`flex items-start gap-3 ${msg.from_user_id === currentUserId ? 'flex-row-reverse' : ''}`}
            >
              <ProfileAvatar userId={msg.from_user_id} className="h-8 w-8 mt-1 border border-white/10" />
              <div className={`flex flex-col ${msg.from_user_id === currentUserId ? 'items-end' : ''}`}>
                <div className="flex items-center gap-1 text-[10px] text-white/40 mb-1 px-1">
                  <ProfileName userId={msg.from_user_id} className="font-semibold" />
                  <span>• {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className={`px-4 py-2.5 rounded-2xl text-sm max-w-[280px] break-words ${
                  msg.from_user_id === currentUserId 
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-500/20' 
                    : 'bg-white/10 text-white/90 rounded-tl-none border border-white/5'
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSendMessage} className="p-4 bg-white/5 border-t border-white/10">
        {!currentUserId ? (
           <div className="text-center py-2 text-sm text-white/40">
              Please <a href="/login" className="text-indigo-400 hover:underline">sign in</a> to respond.
           </div>
        ) : (
           <div className="relative">
              <Textarea
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="bg-black/20 border-white/10 text-white min-h-[50px] max-h-[120px] rounded-2xl pr-12 focus:ring-indigo-500/50"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage(e)
                  }
                }}
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={sending || !newMessage.trim()}
                className="absolute right-2 bottom-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 h-9 w-9 shadow-lg shadow-indigo-500/20"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
           </div>
        )}
      </form>
    </div>
  )
}
