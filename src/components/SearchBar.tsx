'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDebounce } from '@/hooks/use-debounce'

function SearchInput() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  
  const debouncedQuery = useDebounce(query, 500)

  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    if (debouncedQuery) {
      params.set('q', debouncedQuery)
    } else {
      params.delete('q')
    }
    router.push(`/?${params.toString()}`)
  }, [debouncedQuery, router, searchParams])

  return (
    <div className="group relative">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full opacity-20 group-hover:opacity-40 blur transition duration-500"></div>
      <Input
        id="search-input-field"
        type="text"
        className="relative block w-full pl-11 pr-4 py-7 rounded-full glass-dark border-white/10 text-white placeholder-white/40 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-0 text-xl shadow-2xl transition-all hover:bg-white/5"
        placeholder="Search for anything..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  )
}

export function SearchBar() {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
        <Search className="h-5 w-5 text-white/50" />
      </div>
      <Suspense fallback={
        <Input
          id="search-input-field"
          type="text"
          className="block w-full pl-11 pr-4 py-6 rounded-full glass bg-white/10 border-white/20 text-white placeholder-white/50 text-lg"
          placeholder="Loading search..."
          disabled
        />
      }>
        <SearchInput />
      </Suspense>
    </div>
  )
}
