import { motion } from "framer-motion"

export function LiveIndicator({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <div className="h-2 w-2 bg-green-500 rounded-full" />
        <motion.div
          className="absolute inset-0 h-2 w-2 bg-green-500 rounded-full"
          animate={{
            scale: [1, 2, 2],
            opacity: [1, 0.5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      </div>
      <span className="text-xs text-muted-foreground">Live</span>
    </div>
  )
}

export function AnimatedNumber({ 
  value, 
  decimals = 2,
  prefix = "",
  suffix = "",
  trend,
  className = ""
}: { 
  value: number
  decimals?: number
  prefix?: string
  suffix?: string
  trend?: "up" | "down" | null
  className?: string
}) {
  const formattedValue = value.toFixed(decimals)
  const [integerPart, decimalPart] = formattedValue.split('.')
  
  return (
    <motion.div 
      className={`flex items-baseline gap-0.5 ${className}`}
      key={value}
      initial={{ opacity: 0.8, y: trend === "up" ? 2 : trend === "down" ? -2 : 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <span>{prefix}</span>
      <span className={trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : ""}>
        {integerPart}
      </span>
      {decimals > 0 && (
        <>
          <span className={trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : ""}>.</span>
          <span className={`text-sm ${trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : ""}`}>
            {decimalPart}
          </span>
        </>
      )}
      <span>{suffix}</span>
    </motion.div>
  )
}

export function StatusToast({ 
  message, 
  type = "success" 
}: { 
  message: string
  type?: "success" | "error" | "info"
}) {
  const icons = {
    success: "✓",
    error: "✕",
    info: "ℹ"
  }
  
  const colors = {
    success: "bg-green-50 text-green-800 border-green-200",
    error: "bg-red-50 text-red-800 border-red-200",
    info: "bg-blue-50 text-blue-800 border-blue-200"
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg border ${colors[type]}`}
    >
      <span className="text-lg">{icons[type]}</span>
      <span className="text-sm">{message}</span>
    </motion.div>
  )
}