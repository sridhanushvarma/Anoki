"use client"

// Route segment configuration
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect } from 'react'
import RecommendedTools from '@/components/RecommendedTools'
import useToolTracking from '@/hooks/useToolTracking'
import { saveToolInteraction } from '@/utils/recommendationEngine'

interface AITool {
  name: string
  description: string
  url: string
  logoUrl: string
}

export default function AIToolsPage() {
  // Track that user is viewing the AI Tools page
  useToolTracking('ai-tools-page');
  const aiTools: AITool[] = [
    {
      name: "ChatGPT",
      description: "OpenAI's conversational AI",
      url: "https://chat.openai.com",
      logoUrl: "/images/ai-tools/chatgpt.svg"
    },
    {
      name: "Gemini",
      description: "Google's multimodal AI",
      url: "https://gemini.google.com",
      logoUrl: "/images/ai-tools/gemini.svg"
    },
    {
      name: "Claude",
      description: "Anthropic's helpful assistant",
      url: "https://claude.ai",
      logoUrl: "/images/ai-tools/claude.svg"
    },
    {
      name: "Perplexity",
      description: "AI-powered search engine",
      url: "https://perplexity.ai",
      logoUrl: "/images/ai-tools/perplexity.svg"
    },
    {
      name: "Mistral AI",
      description: "Open-weight language models",
      url: "https://mistral.ai",
      logoUrl: "/images/ai-tools/mistral.svg"
    },
    {
      name: "Midjourney",
      description: "AI image generation",
      url: "https://www.midjourney.com",
      logoUrl: "/images/ai-tools/midjourney.svg"
    },
    {
      name: "DALL-E",
      description: "OpenAI's image generator",
      url: "https://openai.com/dall-e-3",
      logoUrl: "/images/ai-tools/dalle.svg"
    },
    {
      name: "Stability AI",
      description: "Open-source image models",
      url: "https://stability.ai",
      logoUrl: "/images/ai-tools/stability.svg"
    },
    {
      name: "Hugging Face",
      description: "AI model repository",
      url: "https://huggingface.co",
      logoUrl: "/images/ai-tools/huggingface.svg"
    },
    {
      name: "Runway",
      description: "AI video generation",
      url: "https://runwayml.com",
      logoUrl: "/images/ai-tools/runway.svg"
    }
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <>
      {/* Page Header */}
      <section className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4">AI Tools</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Access popular AI agents and tools with a single click. All links open in a new tab.
          </p>
        </motion.div>
      </section>

      {/* AI Tools Grid */}
      <motion.section
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-16"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {aiTools.map((tool, index) => (
          <motion.div key={index} variants={item}>
            <a
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 flex flex-col items-center tool-card h-full"
              onClick={() => {
                // Track tool click for recommendation engine
                const toolId = tool.name.toLowerCase().replace(/\s+/g, '-');
                saveToolInteraction(toolId);
              }}
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3">
                <Image
                  src={tool.logoUrl}
                  alt={tool.name}
                  width={48}
                  height={48}
                  sizes="48px"
                  className="object-contain"
                  unoptimized
                />
              </div>
              <h2 className="text-lg font-semibold mb-1">{tool.name}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                {tool.description}
              </p>
            </a>
          </motion.div>
        ))}
      </motion.section>

      {/* Recommended Tools */}
      <RecommendedTools title="Recommended AI Tools" limit={4} />

      {/* Additional Resources */}
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-16">
        <h2 className="text-2xl font-bold mb-6">Additional AI Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-3">Learning Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://www.coursera.org/specializations/deep-learning" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Deep Learning Specialization (Coursera)
                </a>
              </li>
              <li>
                <a href="https://www.fast.ai/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Fast.ai Practical Deep Learning
                </a>
              </li>
              <li>
                <a href="https://www.kaggle.com/learn" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Kaggle Learn
                </a>
              </li>
              <li>
                <a href="https://www.deeplearning.ai/short-courses/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                  DeepLearning.AI Short Courses
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-3">AI News & Trends</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://www.theverge.com/ai-artificial-intelligence" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                  The Verge - AI News
                </a>
              </li>
              <li>
                <a href="https://venturebeat.com/category/ai/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                  VentureBeat - AI
                </a>
              </li>
              <li>
                <a href="https://www.technologyreview.com/topic/artificial-intelligence/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                  MIT Technology Review - AI
                </a>
              </li>
              <li>
                <a href="https://www.reddit.com/r/MachineLearning/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                  r/MachineLearning
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  )
}
