'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { CheckCircle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ClaimButtonProps {
  itemId: string
  currentStatus: string
}

export function ClaimButton({ itemId, currentStatus }: ClaimButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleClaim = async () => {
    setLoading(true)
    const { error } = await supabase
      .from('items')
      .update({ status: 'claimed' })
      .eq('id', itemId)

    if (!error) {
      router.refresh()
    }
    setLoading(false)
  }

  if (currentStatus === 'claimed') {
    return (
      <div className="flex items-center text-emerald-400 font-semibold bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
        <CheckCircle className="w-5 h-5 mr-2" />
        Claimed & Resolved
      </div>
    )
  }

  return (
    <Button 
      onClick={handleClaim} 
      disabled={loading}
      className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
      Mark as Claimed
    </Button>
  )
}
