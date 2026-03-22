'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Image as ImageOff } from 'lucide-react'

interface ResilientImageProps {
  src: string
  alt: string
  fill?: boolean
  className?: string
  priority?: boolean
  unoptimized?: boolean
}

export function ResilientImage({ src, alt, fill, className, priority, unoptimized }: ResilientImageProps) {
  const [error, setError] = useState(false)

  if (!src || error) {
    return (
      <div className={`flex flex-col items-center justify-center bg-white/5 text-white/20 ${className} ${fill ? 'absolute inset-0' : ''}`}>
        <ImageOff className="w-12 h-12 mb-2 opacity-20" />
        <span className="text-xs font-medium uppercase tracking-widest opacity-30">Image Unavailable</span>
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      priority={priority}
      unoptimized={unoptimized}
      onError={() => {
        console.warn(`ResilientImage: Failed to load ${src}`)
        setError(true)
      }}
    />
  )
}
