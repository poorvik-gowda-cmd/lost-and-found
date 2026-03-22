import { ItemGrid } from '@/components/ItemGrid'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/server'
import { Ghost, Search, MapPin, Tag } from 'lucide-react'
import { Hero } from '@/components/Hero'
import { FilterSection } from '@/components/FilterSection'

export const dynamic = 'force-dynamic'

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const query = params.q as string
  const category = params.category as string
  const location = params.location as string
  
  const supabase = await createClient()

  const fetchItems = async (type: 'lost' | 'found') => {
    // 1. Try fetching with profiles join first (Ideal case)
    let qb = supabase
      .from('items')
      .select('*')
      .eq('type', type)
      .order('created_at', { ascending: false })

    if (query) {
      qb = qb.or(`title.ilike.%${query}%,category.ilike.%${query}%,location.ilike.%${query}%`)
    }
    if (category && category !== 'all') {
      qb = qb.eq('category', category)
    }
    if (location) {
      qb = qb.ilike('location', `%${location}%`)
    }

    let { data, error } = await qb

    // 2. Fallback: If join fails, fetch items only
    if (error) {
      console.warn("Retrying fetch without profiles join due to error:", error.message || error)
      
      let fallbackQb = supabase
        .from('items')
        .select('*')
        .eq('type', type)
        .order('created_at', { ascending: false })

      if (query) {
        fallbackQb = fallbackQb.or(`title.ilike.%${query}%,category.ilike.%${query}%,location.ilike.%${query}%`)
      }
      if (category && category !== 'all') {
        fallbackQb = fallbackQb.eq('category', category)
      }
      if (location) {
        fallbackQb = fallbackQb.ilike('location', `%${location}%`)
      }

      const { data: fallbackData, error: fallbackError } = await fallbackQb
      
      if (fallbackError) {
        console.error("Critical Supabase Error (Items only):", fallbackError)
        return []
      }
      
      return fallbackData
    }

    return data
  }

  const [lostItems, foundItems] = await Promise.all([
    fetchItems('lost'),
    fetchItems('found')
  ])

  return (
    <div className="min-h-screen flex flex-col pb-20">
      <Hero />

      {/* Feed Section */}
      <section className="container mx-auto px-4">
        <Tabs defaultValue="lost" className="w-full">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
            <TabsList className="glass h-14 p-1 rounded-2xl w-full md:w-auto grid grid-cols-2 min-w-[300px]">
              <TabsTrigger 
                value="lost" 
                className="rounded-xl data-[state=active]:bg-rose-500 data-[state=active]:text-white text-lg font-semibold transition-all hover:bg-white/5"
              >
                <Ghost className="w-5 h-5 mr-3" /> Lost Items
              </TabsTrigger>
              <TabsTrigger 
                value="found" 
                className="rounded-xl data-[state=active]:bg-emerald-500 data-[state=active]:text-white text-lg font-semibold transition-all hover:bg-white/5"
              >
                <Search className="w-5 h-5 mr-3" /> Found Items
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
               <FilterSection />
            </div>
          </div>

          <TabsContent value="lost" className="mt-0 outline-none">
            <ItemGrid items={lostItems || []} />
          </TabsContent>
          <TabsContent value="found" className="mt-0 outline-none">
            <ItemGrid items={foundItems || []} />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  )
}
