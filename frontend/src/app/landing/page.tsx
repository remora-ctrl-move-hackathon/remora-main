"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, Shield, TrendingUp, Globe } from "lucide-react"
import { motion } from "framer-motion"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8 }
}

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 1.0 }
}

const slideInLeft = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 1.2, ease: "easeOut" }
}

const slideInRight = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 1.2, ease: "easeOut" }
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 1.0, ease: "easeOut" }
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Header */}
      <main className="bg-teal-700">
        {/* Header */}
        <motion.header 
          className="border-b border-white/10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-light text-white">REMORA</div>
              <Link href="/">
                <Button 
                  className="bg-white text-teal-700 hover:bg-white/90 font-normal"
                >
                  Launch App →
                </Button>
              </Link>
            </div>
          </div>
        </motion.header>
        <div className="py-32">
          <div className="max-w-7xl mx-auto px-8">
            <div className="max-w-4xl text-white">
              <motion.h1 
                className="text-6xl md:text-8xl font-extralight mb-8 leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Access Your Funds,<br />
                Anytime, Anywhere.
              </motion.h1>
              
              <motion.p 
                className="text-xl text-white/80 max-w-3xl mb-12 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Stream payments, trade perpetuals, and manage vaults across the globe. 
                Work anywhere without worrying about outdated financial systems.
              </motion.p>
              
              <motion.div 
                className="flex gap-4 mb-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Link href="/">
                  <Button 
                    size="lg"
                    className="bg-white text-teal-700 hover:bg-white/90 font-normal px-8 py-6 text-base"
                  >
                    Launch App
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/docs">
                  <Button 
                    size="lg"
                    className="bg-white/10 backdrop-blur-sm border border-white/20 text-white font-normal px-8 py-6 text-base"
                  >
                    Learn More
                  </Button>
                </Link>
              </motion.div>

              {/* Key Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-40">
                <motion.div 
                  className="p-6 bg-white/10 rounded-xl backdrop-blur-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">150x Leverage</h3>
                  <p className="text-sm text-white/70">Trade perpetuals with industry-leading leverage and deep liquidity</p>
                </motion.div>
                
                <motion.div 
                  className="p-6 bg-white/10 rounded-xl backdrop-blur-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">Real-Time Streaming</h3>
                  <p className="text-sm text-white/70">Programmable money flows that work 24/7 automatically</p>
                </motion.div>
                
                <motion.div 
                  className="p-6 bg-white/10 rounded-xl backdrop-blur-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">Global Remittance</h3>
                  <p className="text-sm text-white/70">Send money anywhere with instant fiat off-ramps</p>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Feature Section 1 */}
      <section className="py-48 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div variants={slideInLeft}>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-800/10 text-teal-800 mb-6">
                <Shield className="h-3 w-3 mr-2" />
                Enterprise-Grade Protection
              </div>
              
              <h2 className="text-4xl md:text-5xl font-light text-teal-800 mb-6">
                Data security you<br />
                can trust.
              </h2>
              
              <p className="text-lg text-teal-800/70 mb-8">
                End-to-end encryption, role-based access, and global compliance standards 
                keep your funds safe—so you can focus on what matters most.
              </p>
              
              <Link href="/">
                <button className="text-teal-800 hover:text-teal-900 inline-flex items-center font-medium">
                  Learn more
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </Link>
            </motion.div>
            
            <motion.div 
              className="relative flex items-center justify-center"
              variants={scaleIn}
            >
              <Image 
                src="/Satoshi_Complete/LockImage.png" 
                alt="Security" 
                width={500} 
                height={500}
                className="object-contain"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Feature Section 2 */}
      <section className="py-48 bg-teal-800/5">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div 
              className="order-2 lg:order-1 flex items-center justify-center"
              variants={scaleIn}
            >
              <Image 
                src="/Satoshi_Complete/Trading.png" 
                alt="Trading" 
                width={500} 
                height={500}
                className="object-contain"
              />
            </motion.div>
            
            <motion.div 
              className="order-1 lg:order-2"
              variants={slideInRight}
            >
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-800/10 text-teal-800 mb-6">
                <TrendingUp className="h-3 w-3 mr-2" />
                Advanced Trading
              </div>
              
              <h2 className="text-4xl md:text-5xl font-light text-teal-800 mb-6">
                Trade with<br />
                confidence.
              </h2>
              
              <p className="text-lg text-teal-800/70 mb-8">
                Access perpetual markets with up to 150x leverage, automated vault strategies, 
                and real-time streaming payments—all from one unified platform.
              </p>
              
              <Link href="/">
                <button className="text-teal-800 hover:text-teal-900 inline-flex items-center font-medium">
                  Start trading
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Feature Section 3 */}
      <section className="py-48 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div variants={slideInLeft}>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-800/10 text-teal-800 mb-6">
                <Globe className="h-3 w-3 mr-2" />
                Global Remittance
              </div>
              
              <h2 className="text-4xl md:text-5xl font-light text-teal-800 mb-6">
                Send money<br />
                globally.
              </h2>
              
              <p className="text-lg text-teal-800/70 mb-8">
                Instant cross-border payments with direct fiat off-ramps. 
                Send funds anywhere in the world with minimal fees and maximum speed.
              </p>
              
              <Link href="/">
                <button className="text-teal-800 hover:text-teal-900 inline-flex items-center font-medium">
                  Explore remittance
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </Link>
            </motion.div>
            
            <motion.div 
              className="relative flex items-center justify-center"
              variants={scaleIn}
            >
              <Image 
                src="/Satoshi_Complete/Payment.png" 
                alt="Global Remittance" 
                width={500} 
                height={500}
                className="object-contain"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-48 bg-teal-800">
        <motion.div 
          className="max-w-4xl mx-auto px-8 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <h2 className="text-4xl md:text-5xl font-light text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-lg text-white/80 mb-12">
            Join thousands of users already using Remora for their DeFi needs.
          </p>
          <Link href="/">
            <Button 
              size="lg"
              className="bg-white text-teal-800 hover:bg-white/90 font-normal px-8 py-6 text-base"
            >
              Launch App
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-teal-800/10 py-12 bg-white">
        <motion.div 
          className="max-w-7xl mx-auto px-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.0 }}
        >
          <div className="flex items-center justify-between">
            <div className="text-teal-800/60 text-sm">
              © 2025 Remora Finance. Built on Aptos.
            </div>
            <div className="flex items-center gap-8 text-teal-800/60 text-sm">
              <Link href="/docs" className="hover:text-teal-800">Documentation</Link>
              <Link href="https://github.com" className="hover:text-teal-800">GitHub</Link>
              <Link href="https://discord.com" className="hover:text-teal-800">Discord</Link>
            </div>
          </div>
        </motion.div>
      </footer>
    </div>
  )
}