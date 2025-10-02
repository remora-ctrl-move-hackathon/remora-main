"use client"

import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

// Skeleton loader with shimmer effect
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg ${className}`} />
  )
}

// Card loading state
export function CardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border rounded-lg p-6 space-y-4"
    >
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-16" />
      </div>
    </motion.div>
  )
}

// Button loading state with spinner
export function LoadingButton({ 
  loading, 
  children, 
  className = "" 
}: { 
  loading: boolean
  children: React.ReactNode
  className?: string 
}) {
  return (
    <motion.button
      className={`relative transition-all ${className}`}
      whileTap={{ scale: loading ? 1 : 0.95 }}
      disabled={loading}
    >
      <motion.div
        animate={{ opacity: loading ? 0.5 : 1 }}
        className="flex items-center gap-2"
      >
        {loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Loader2 className="h-4 w-4 animate-spin" />
          </motion.div>
        )}
        {children}
      </motion.div>
    </motion.button>
  )
}

// Transaction success animation
export function TransactionSuccess({ show }: { show: boolean }) {
  if (!show) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 1] }}
        transition={{ duration: 0.5 }}
        className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center"
      >
        <motion.svg
          className="w-20 h-20 text-white"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.path
            d="M20 6L9 17l-5-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
      </motion.div>
    </motion.div>
  )
}

// Number ticker animation
export function AnimatedNumber({ 
  value, 
  prefix = "", 
  suffix = "" 
}: { 
  value: number
  prefix?: string
  suffix?: string
}) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="inline-block tabular-nums"
    >
      {prefix}{value.toLocaleString()}{suffix}
    </motion.span>
  )
}

// Progress bar with animation
export function AnimatedProgress({ value }: { value: number }) {
  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-primary to-primary/80"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
  )
}

// Pulse animation for live data
export function LiveIndicator() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="w-2 h-2 bg-green-500 rounded-full" />
        <motion.div
          className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full"
          animate={{
            scale: [1, 2, 2],
            opacity: [1, 0, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: 0.5,
          }}
        />
      </div>
      <span className="text-xs text-green-600">Live</span>
    </div>
  )
}

// Hover card effect
export function HoverCard({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <motion.div
      className={`relative ${className}`}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg opacity-0"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}