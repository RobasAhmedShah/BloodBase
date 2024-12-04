'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export function BloodDroplet() {
  return (
    <motion.div
      className="absolute w-4 h-6 bg-red-600 rounded-t-full rounded-b-full"
      animate={{
        y: [0, 400],
        opacity: [1, 0],
      }}
      transition={{
        duration: Math.random() * 2 + 2,
        ease: "easeIn",
        repeat: Infinity,
      }}
      style={{
        left: `${Math.random() * 100}%`,
        top: -24,
      }}
    />
  )
}

export function BloodDropletAnimation() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 10 }).map((_, i) => (
        <BloodDroplet key={i} />
      ))}
    </div>
  )
}

