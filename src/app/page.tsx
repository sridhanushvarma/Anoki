"use client"

import { FiActivity, FiUpload, FiShield, FiClock, FiCommand } from 'react-icons/fi'
import ToolCard from '@/components/ToolCard'
import { motion } from 'framer-motion'
import RecommendedTools from '@/components/RecommendedTools'
import useToolTracking from '@/hooks/useToolTracking'

export default function Home() {
  // Track homepage visit
  useToolTracking('homepage');
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

      {/* Tools Categories */}
      <motion.section
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item}>
          <ToolCard
            title="AI Tools"
            description="Access popular AI agents like ChatGPT, Gemini, Claude, and more."
            icon={<FiActivity className="h-8 w-8" />}
            href="/ai-tools"
            bgColor="bg-blue-100 dark:bg-blue-900"
            iconColor="text-blue-600 dark:text-blue-400"
          />
        </motion.div>

        <motion.div variants={item}>
          <ToolCard
            title="File Converters"
            description="Convert between different file formats like PDF, DOCX, JPG, PNG, and more."
            icon={<FiUpload className="h-8 w-8" />}
            href="/converters"
            bgColor="bg-green-100 dark:bg-green-900"
            iconColor="text-green-600 dark:text-green-400"
          />
        </motion.div>

        <motion.div variants={item}>
          <ToolCard
            title="AI/Plagiarism Detectors"
            description="Detect AI-generated content and check for plagiarism with popular tools."
            icon={<FiShield className="h-8 w-8" />}
            href="/detectors"
            bgColor="bg-red-100 dark:bg-red-900"
            iconColor="text-red-600 dark:text-red-400"
          />
        </motion.div>

        <motion.div variants={item}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col items-center h-full">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <FiClock className="h-8 w-8 text-gray-600 dark:text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
            <p className="text-gray-600 dark:text-gray-400 text-center">
              More tools and features are on the way. Stay tuned!
            </p>
          </div>
        </motion.div>
      </motion.section>

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
              <FiZap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">All-in-One Solution</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Access all your favorite tools in one place without switching between websites.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
              <FiShield className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Privacy Focused</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Local processing for many tools means your data stays on your device.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4">
              <FiEdit className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Smart Suggestions</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Get personalized tool recommendations based on your usage patterns.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mb-4">
              <FiCommand className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Command Launcher</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Chain multiple tools together with simple natural language commands.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
