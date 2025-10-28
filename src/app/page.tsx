"use client"

import { useState, useEffect } from 'react'
import { FiEdit, FiZap, FiCommand, FiMessageCircle } from 'react-icons/fi'
import ToolCard from '@/components/ToolCard'
import { motion } from 'framer-motion'
import RecommendedTools from '@/components/RecommendedTools'
import useToolTracking from '@/hooks/useToolTracking'

interface Tool {
  title: string
  description: string
  icon: JSX.Element
  href: string
  bgColor: string
  iconColor: string
}

export default function Home() {
  // Track homepage visit
  useToolTracking('homepage');

  const [displayedTools, setDisplayedTools] = useState<Tool[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // All available tools
  const allTools: Tool[] = [
    {
      title: "Image Editor",
      description: "Edit and enhance your images with powerful tools like crop, rotate, resize, and more.",
      icon: <FiEdit className="h-8 w-8" />,
      href: "/editor",
      bgColor: "bg-purple-100 dark:bg-purple-900",
      iconColor: "text-purple-600 dark:text-purple-400"
    },
    {
      title: "Image Enhancer",
      description: "Enhance image quality with AI-powered upscaling, denoising, and sharpening.",
      icon: <FiZap className="h-8 w-8" />,
      href: "/enhancer",
      bgColor: "bg-yellow-100 dark:bg-yellow-900",
      iconColor: "text-yellow-600 dark:text-yellow-400"
    },
    {
      title: "Send Feedback",
      description: "Share your feedback, report bugs, or suggest new features to help us improve.",
      icon: <FiMessageCircle className="h-8 w-8" />,
      href: "/feedback",
      bgColor: "bg-green-100 dark:bg-green-900",
      iconColor: "text-green-600 dark:text-green-400"
    }
  ]

  // Shuffle and select random tools on mount
  useEffect(() => {
    const shuffleTools = () => {
      const shuffled = [...allTools].sort(() => Math.random() - 0.5)
      setDisplayedTools(shuffled)
    }

    shuffleTools()
    setIsInitialized(true)

    // Cycle through tools every 30 seconds
    const interval = setInterval(shuffleTools, 30000)
    return () => clearInterval(interval)
  }, [])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <>
      {/* Hero Section */}
      <section className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to Anoki!</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            A one-stop-shop for accessing popular AI tools, file converters, detectors, editors, and enhancers.
          </p>
        </motion.div>
      </section>

      {/* Tools Categories - Randomly Cycled */}
      {isInitialized && (
        <motion.section
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
          variants={container}
          initial="hidden"
          animate="show"
          key={displayedTools.map(t => t.title).join('-')}
        >
          {displayedTools.map((tool) => (
            <motion.div key={tool.title} variants={item}>
              <ToolCard
                title={tool.title}
                description={tool.description}
                icon={tool.icon}
                href={tool.href}
                bgColor={tool.bgColor}
                iconColor={tool.iconColor}
              />
            </motion.div>
          ))}
        </motion.section>
      )}

      {/* Recommended Tools Section */}
      <RecommendedTools title="Recommended for You" limit={4} />

      {/* Command Launcher Highlight */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800 rounded-lg shadow-md p-8 mb-8 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0 md:mr-8">
            <h2 className="text-2xl font-bold mb-3">New! One-Command AI Tools Launcher</h2>
            <p className="text-white/90 text-lg mb-4">
              Type natural language commands to chain multiple tools together.
            </p>
            <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
              <p className="font-mono text-sm">
                "Convert this PDF to Word and enhance its quality"
              </p>
              <p className="font-mono text-sm mt-2">
                "Check this text for plagiarism and improve its grammar"
              </p>
            </div>
          </div>
          <div className="flex-shrink-0">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-6 w-24 h-24 flex items-center justify-center">
              <FiCommand className="h-12 w-12" />
            </div>
          </div>
        </div>
        <div className="mt-6 text-sm text-white/80">
          Click the Command button in the bottom right corner to try it out!
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center">Why Choose Anoki?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
              <FiZap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Fast & Efficient</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Quick processing with powerful tools for image editing and enhancement.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
              <FiEdit className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Easy to Use</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Intuitive interface designed for both beginners and professionals.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4">
              <FiMessageCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Your Feedback Matters</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Help us improve by sharing your feedback and suggestions.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
