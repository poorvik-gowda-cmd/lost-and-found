'use client'

import { ItemCard, Item } from './ItemCard'
import { motion } from 'framer-motion'

interface ItemGridProps {
  items: Item[]
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export function ItemGrid({ items }: ItemGridProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-20 text-white/60">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold mb-2 text-white">No items found</h3>
        <p>Try adjusting your search or filters.</p>
      </div>
    )
  }

  return (
    <motion.div 
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {items.map((item) => (
        <motion.div key={item.id} variants={itemVariant}>
          <ItemCard item={item} />
        </motion.div>
      ))}
    </motion.div>
  )
}
