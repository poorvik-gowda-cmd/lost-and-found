'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tag, MapPin, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const CATEGORIES = [
  'Electronics',
  'Wallet',
  'Keys',
  'Bag',
  'Clothing',
  'Jewelry',
  'Pets',
  'Others'
]

export function FilterSection() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentCategory = searchParams.get('category') || 'all'
  const currentLocation = searchParams.get('location') || ''

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push('/')
  }

  const hasFilters = currentCategory !== 'all' || currentLocation !== ''

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Category Filter */}
      <div className="flex items-center gap-2">
        <Select value={currentCategory as string} onValueChange={(v) => updateFilters('category', v || 'all')}>
          <SelectTrigger className="h-11 w-[180px] glass-dark border-white/10 rounded-xl text-white/70">
            <div className="flex items-center">
              <Tag className="w-4 h-4 mr-2 text-indigo-400" />
              <SelectValue placeholder="Category" />
            </div>
          </SelectTrigger>
          <SelectContent className="glass-dark border-white/10 text-white">
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(cat => (
              <SelectItem key={cat} value={cat.toLowerCase()}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Location Filter (Simple Input for now or Select) */}
      <div className="relative">
         <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <MapPin className="h-4 w-4 text-rose-400" />
         </div>
         <input 
            type="text"
            placeholder="Filter location..."
            defaultValue={currentLocation}
            onBlur={(e) => updateFilters('location', (e.target as HTMLInputElement).value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') updateFilters('location', (e.target as HTMLInputElement).value)
            }}
            className="h-11 pl-10 pr-4 w-[200px] bg-white/5 border border-white/10 rounded-xl text-white/70 text-sm placeholder:text-white/20 focus:ring-1 focus:ring-indigo-500/50 outline-none"
         />
      </div>

      {hasFilters && (
        <Button 
          variant="ghost" 
          onClick={clearFilters}
          className="h-11 text-white/40 hover:text-white hover:bg-white/5 rounded-xl px-3"
        >
          <X className="w-4 h-4 mr-2" /> Clear
        </Button>
      )}
    </div>
  )
}
