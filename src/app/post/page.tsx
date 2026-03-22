'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, UploadCloud, Image as ImageIcon } from 'lucide-react'

export default function PostItem() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [type, setType] = useState<'lost' | 'found'>('lost')
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      let image_url = ''
      
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${user.id}/${fileName}`

        const { error: uploadError, data } = await supabase.storage
          .from('item-images')
          .upload(filePath, imageFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('item-images')
          .getPublicUrl(filePath)
          
        image_url = publicUrl
      }

      const { error: dbError, data: newItem } = await supabase.from('items').insert({
        title,
        description,
        category,
        location,
        type,
        image_url,
        user_id: user.id,
        status: 'open',
      }).select().single()

      if (dbError) throw dbError

      // Trigger matching and notification logic
      try {
        const response = await fetch('/api/match-notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ item: newItem })
        })
        const result = await response.json()
        
        if (!response.ok) {
          console.error('Matching API Error:', result.error)
          if (result.error?.includes('.env.local')) {
            alert(`Email System Notice: ${result.error}`)
          }
        } else if (result.matchCount > 0) {
          alert(`Great! We found ${result.matchCount} possible matches for your item. Notifications have been sent!`)
        }
      } catch (notifyErr) {
        console.error('Notification error:', notifyErr)
      }

      router.push(`/item/${newItem.id}`)
      router.refresh()
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-20 max-w-3xl">
      <Button 
        variant="ghost" 
        onClick={() => router.push('/')} 
        className="mb-8 text-white/50 hover:text-white hover:bg-white/5 rounded-full"
      >
        ← Back to Home
      </Button>

      <Card className="glass-dark border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <CardHeader className="text-center pt-12 pb-10 px-8 border-b border-white/5">
          <CardTitle className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter">
            Post an <span className="gradient-text">Item</span>
          </CardTitle>
          <CardDescription className="text-white/50 text-lg max-w-md mx-auto">
            Help the community by sharing details about what you lost or found.
          </CardDescription>
        </CardHeader>

        <CardContent className="w-full">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex justify-center mb-6">
              <Tabs value={type} onValueChange={(v) => setType(v as 'lost' | 'found')} className="w-full max-w-sm">
                <TabsList className="grid grid-cols-2 h-14 bg-black/20 rounded-full p-1 border border-white/10">
                  <TabsTrigger 
                    value="lost" 
                    className="rounded-full text-white/70 data-[state=active]:bg-rose-500 data-[state=active]:text-white transition-all text-lg"
                  >
                    I Lost It
                  </TabsTrigger>
                  <TabsTrigger 
                    value="found" 
                    className="rounded-full text-white/70 data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all text-lg"
                  >
                    I Found It
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {error && (
              <div className="bg-destructive/20 border border-destructive/50 text-destructive-foreground p-4 rounded-xl text-center">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="title" className="text-white/60 text-sm font-semibold uppercase tracking-wider ml-1">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g. Blue Ridge Wallet"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-14 rounded-2xl focus:ring-indigo-500/50"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="category" className="text-white/60 text-sm font-semibold uppercase tracking-wider ml-1">Category *</Label>
                <Select value={category} onValueChange={(val) => setCategory(val || '')} required>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white h-14 rounded-2xl focus:ring-indigo-500/50">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="glass-dark border-white/10 text-white">
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="wallet">Wallet & Cards</SelectItem>
                    <SelectItem value="keys">Keys</SelectItem>
                    <SelectItem value="bag">Bag/Luggage</SelectItem>
                    <SelectItem value="clothing">Clothing</SelectItem>
                    <SelectItem value="jewelry">Jewelry</SelectItem>
                    <SelectItem value="pets">Pets</SelectItem>
                    <SelectItem value="others">Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 md:col-span-2">
                <Label htmlFor="location" className="text-white/60 text-sm font-semibold uppercase tracking-wider ml-1">Location *</Label>
                <Input
                  id="location"
                  placeholder="e.g. Central Park near the fountain"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 h-14 rounded-2xl focus:ring-indigo-500/50"
                  required
                />
              </div>

              <div className="space-y-3 md:col-span-2">
                <Label htmlFor="description" className="text-white/60 text-sm font-semibold uppercase tracking-wider ml-1">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed description, unique marks, color..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[140px] rounded-2xl focus:ring-indigo-500/50 pt-4"
                />
              </div>

                <div className="relative group">
                  <div className="border-2 border-dashed border-white/20 rounded-2xl p-4 hover:bg-white/5 transition-colors text-center relative overflow-hidden min-h-[200px] flex items-center justify-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    />
                    
                    {imagePreview ? (
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl">
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center z-10">
                            <UploadCloud className="w-8 h-8 text-white mb-2" />
                            <p className="text-white font-medium">Click to Change Image</p>
                          </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-white/40 py-10">
                         <div className="bg-white/5 p-4 rounded-full mb-4">
                            <ImageIcon className="w-10 h-10 text-indigo-400/60" />
                         </div>
                         <p className="font-semibold text-white/80">Click or drag image to upload</p>
                         <p className="text-xs mt-2">Recommended: 1200x630px (Max 5MB)</p>
                      </div>
                    )}
                  </div>
                </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-lg font-semibold shadow-xl shadow-indigo-500/20"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {loading ? 'Posting...' : type === 'lost' ? 'Post Lost Item' : 'Post Found Item'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
