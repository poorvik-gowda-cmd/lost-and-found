'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { SearchBar } from './SearchBar'
import { Filter } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-4 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-indigo-600/20 blur-[120px] rounded-full -z-10"></div>
      
      <div className="container mx-auto text-center max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass border-white/10 mb-8"
        >
          <Badge variant="secondary" className="bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 border-0">New</Badge>
          <span className="text-sm text-white/70">Connect with the community to find what you lost</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-tight"
        >
          Lost it? <span className="gradient-text">Find it.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          The modern way to track and recover lost belongings. Search, post, and connect in seconds.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="max-w-2xl mx-auto mb-16"
        >
          <SearchBar />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-4 text-white/40 text-sm"
        >
           <span className="flex items-center"><Filter className="w-4 h-4 mr-2" /> Recent Searches:</span>
           {['Wallet', 'Keys', 'iPhone', 'Backpack'].map((item) => (
              <a key={item} href={`/?q=${item}`} className="px-3 py-1 rounded-full border border-white/5 hover:border-white/20 hover:text-white transition-all">
                {item}
              </a>
           ))}
        </motion.div>
      </div>
    </section>
  )
}
