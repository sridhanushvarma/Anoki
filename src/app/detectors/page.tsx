"use client"

// Route segment configuration
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { motion } from 'framer-motion'
import { FiShield, FiExternalLink } from 'react-icons/fi'

interface DetectorTool {
  name: string
  description: string
  url: string
  features: string[]
  pricing: string
}

export default function DetectorsPage() {
  const detectorTools: DetectorTool[] = [
    {
      name: "GPTZero",
      description: "Detect AI-generated text with high accuracy, designed specifically for educators and students.",
      url: "https://gptzero.me/",
      features: [
        "Paragraph-by-paragraph analysis",
        "Batch processing",
        "Document upload",
        "API access"
      ],
      pricing: "Free tier available, paid plans start at $9.99/month"
    },
    {
      name: "Turnitin",
      description: "Industry-standard plagiarism detection used by educational institutions worldwide.",
      url: "https://www.turnitin.com/",
      features: [
        "Comprehensive database comparison",
        "Integration with learning management systems",
        "AI writing detection",
        "Originality reports"
      ],
      pricing: "Contact for institutional pricing"
    },
    {
      name: "Copyleaks",
      description: "AI content detector and plagiarism checker with enterprise-grade capabilities.",
      url: "https://copyleaks.com/",
      features: [
        "AI content detection",
        "Plagiarism checking",
        "Multiple language support",
        "API integration"
      ],
      pricing: "Free trial, business plans available"
    },
    {
      name: "Content at Scale",
      description: "AI content detector that can identify content from various AI models.",
      url: "https://contentatscale.ai/ai-content-detector/",
      features: [
        "Multi-model detection",
        "Percentage scores",
        "Free to use",
        "No registration required"
      ],
      pricing: "Free"
    },
    {
      name: "Sapling.ai",
      description: "AI detector that provides probability scores for AI-generated content.",
      url: "https://sapling.ai/ai-content-detector",
      features: [
        "Probability scoring",
        "Fast results",
        "No login required",
        "Simple interface"
      ],
      pricing: "Free"
    },
    {
      name: "Winston AI",
      description: "Advanced AI content detector with high accuracy rates.",
      url: "https://gowinston.ai/",
      features: [
        "High accuracy detection",
        "Detailed reports",
        "API access",
        "Bulk checking"
      ],
      pricing: "Free tier available, paid plans for professionals"
    }
  ]

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
      {/* Page Header */}
      <section className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4">AI & Plagiarism Detectors</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Tools to detect AI-generated content and check for plagiarism in academic and professional work.
          </p>
        </motion.div>
      </section>

      {/* Detector Tools List */}
      <motion.section 
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {detectorTools.map((tool, index) => (
          <motion.div 
            key={index} 
            variants={item}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mr-3">
                  <FiShield className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-xl font-semibold">{tool.name}</h2>
              </div>
              <a 
                href={tool.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center"
              >
                <span className="mr-1">Visit</span>
                <FiExternalLink className="h-4 w-4" />
              </a>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {tool.description}
            </p>
            
            <div className="mb-4">
              <h3 className="font-medium mb-2">Key Features:</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400">
                {tool.features.map((feature, i) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
            </div>
            
            <div className="text-sm text-gray-500 dark:text-gray-500">
              <strong>Pricing:</strong> {tool.pricing}
            </div>
          </motion.div>
        ))}
      </motion.section>

      {/* Usage Tips */}
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-16">
        <h2 className="text-2xl font-bold mb-6">Tips for Using AI & Plagiarism Detectors</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-3">For Educators</h3>
            <ul className="space-y-3">
              <li className="flex">
                <span className="text-green-600 dark:text-green-400 mr-2">✓</span>
                <span>Use multiple detectors for more accurate results</span>
              </li>
              <li className="flex">
                <span className="text-green-600 dark:text-green-400 mr-2">✓</span>
                <span>Consider false positives and review flagged content manually</span>
              </li>
              <li className="flex">
                <span className="text-green-600 dark:text-green-400 mr-2">✓</span>
                <span>Establish clear policies about AI usage in your syllabus</span>
              </li>
              <li className="flex">
                <span className="text-green-600 dark:text-green-400 mr-2">✓</span>
                <span>Use detection as a teaching opportunity, not just for punishment</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-3">For Writers</h3>
            <ul className="space-y-3">
              <li className="flex">
                <span className="text-green-600 dark:text-green-400 mr-2">✓</span>
                <span>Check your AI-edited content before submission</span>
              </li>
              <li className="flex">
                <span className="text-green-600 dark:text-green-400 mr-2">✓</span>
                <span>Properly cite AI tools if you've used them for assistance</span>
              </li>
              <li className="flex">
                <span className="text-green-600 dark:text-green-400 mr-2">✓</span>
                <span>Understand that detectors aren't perfect and may have false positives</span>
              </li>
              <li className="flex">
                <span className="text-green-600 dark:text-green-400 mr-2">✓</span>
                <span>Heavily edit AI-generated content to add your unique voice</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-yellow-800 dark:text-yellow-200 mb-8">
        <p className="text-sm">
          <strong>Disclaimer:</strong> No AI detection tool is 100% accurate. These tools should be used as aids, not as definitive proof of AI usage or plagiarism. Always review flagged content manually and use your judgment.
        </p>
      </div>
    </>
  )
}
