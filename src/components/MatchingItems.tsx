'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ItemCard, Item } from './ItemCard'
import { Sparkles, Loader2, Tag, Info } from 'lucide-react'

interface MatchingItemsProps {
  item: Item
}

export function MatchingItems({ item }: MatchingItemsProps) {
  const [matches, setMatches] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchMatches = async () => {
      // Find items of the opposite type with similar title or same category
      const targetType = item.type === 'lost' ? 'found' : 'lost'
      
      // Basic similarity logic: same category OR title overlap
      // For title overlap, we can split the title into words and use ILIKE for the first significant word
      const titleWords = item.title.split(' ').filter(w => w.length > 3)
      const firstWord = titleWords[0] || item.title

      let query = supabase
        .from('items')
        .select('*') // Removed profiles(full_name, avatar_url)
        .eq('type', targetType)
        .eq('status', 'open')
        .neq('id', item.id)

      if (firstWord) {
        query = query.or(`category.eq.${item.category},title.ilike.%${firstWord}%`)
      } else {
        query = query.eq('category', item.category)
      }

      // Fetch items
      let { data, error } = await query.limit(4)

      if (error) {
        console.warn("MatchingItems: Retrying without profiles join:", error.message || error)
        
        let fallbackQuery = supabase
          .from('items')
          .select('*')
          .eq('type', targetType)
          .eq('status', 'open')
          .neq('id', item.id)

        if (firstWord) {
          fallbackQuery = fallbackQuery.or(`category.eq.${item.category},title.ilike.%${firstWord}%`)
        } else {
          fallbackQuery = fallbackQuery.eq('category', item.category)
        }

        const { data: fallbackData, error: fallbackError } = await fallbackQuery.limit(4)
        
        if (fallbackError) {
          console.error("MatchingItems: Critical Error:", fallbackError)
        } else if (fallbackData) {
          setMatches(fallbackData as any)
        }
      } else if (data) {
        setMatches(data as any)
      }
      setLoading(false)
    }

    if (item.id) {
      fetchMatches()
    }
  }, [item])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (matches.length === 0) return null

  return (
    <section className="space-y-8 py-10 border-t border-white/5">
      <div className="flex items-center justify-between">
         <h2 className="text-3xl font-bold text-white flex items-center">
            <Tag className="w-8 h-8 mr-4 text-indigo-400" />
            Matching Suggestions
         </h2>
      </div>

      {matches.length === 0 ? (
        <div className="glass-dark border border-white/5 rounded-[2rem] p-10 text-center">
           <Info className="w-12 h-12 text-white/10 mx-auto mb-4" />
           <p className="text-white/40 text-lg">We couldn't find any direct matches for this item yet.</p>
           <p className="text-white/20 text-sm mt-2">Matches appear when items of the opposite type (Lost vs Found) share categories or words.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {matches.map((item) => (
            <ItemCard key={item.id} item={item as any} />
          ))}
        </div>
      )}
    </section>
  )
}
