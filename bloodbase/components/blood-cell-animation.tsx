'use client'

import { motion } from 'framer-motion'

const BloodCell = ({ delay = 0 }) => (
  <motion.div
    className="absolute w-8 h-8 bg-red-600 rounded-full opacity-70"
    initial={{ scale: 0, x: '-50%', y: '-50%' }}
    animate={{
      scale: [1, 1.2, 1],
      x: ['0%', '100%', '0%'],
      y: ['0%', '100%', '0%'],
    }}
    transition={{
      duration: 20,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    style={{
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
    }}
  />
)

export const BloodCellAnimation = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 20 }).map((_, i) => (
      <BloodCell key={i} delay={i * 0.5} />
    ))}
  </div>
)

