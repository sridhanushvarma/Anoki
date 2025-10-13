"use client"

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FiExternalLink, FiZap, FiTool, FiImage, FiFileText, FiSearch, FiCheck, FiClock } from 'react-icons/fi'

interface FeatureCardProps {
  title: string
  description: string
  url: string
  category: string
  isExternal?: boolean
  delay?: number
  tags?: string[]
  features?: string[]
  status?: 'ready' | 'beta' | 'coming-soon'
  onClick?: () => void
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  title, 
  description, 
  url, 
  category, 
  isExternal = false,
  delay = 0,
  tags = [],
  features = [],
  status = 'ready',
  onClick
}) => {
  const getCategoryIcon = () => {
    switch (category) {
      case 'converters':
        return <FiFileText className="h-6 w-6" />
      case 'editors':
        return <FiTool className="h-6 w-6" />
      case 'enhancers':
        return <FiZap className="h-6 w-6" />
      case 'detectors':
        return <FiSearch className="h-6 w-6" />
      case 'ai-tools':
        return <FiImage className="h-6 w-6" />
      default:
        return <FiTool className="h-6 w-6" />
    }
  }

  const getCategoryColor = () => {
    switch (category) {
      case 'converters':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
      case 'editors':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400'
      case 'enhancers':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400'
      case 'detectors':
        return 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
      case 'ai-tools':
        return 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
      default:
        return 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400'
    }
  }

  const getStatusBadge = () => {
    switch (status) {
      case 'ready':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
            <FiCheck className="h-3 w-3 mr-1" />
            Ready
          </span>
        )
      case 'beta':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
            <FiZap className="h-3 w-3 mr-1" />
            Beta
          </span>
        )
      case 'coming-soon':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            <FiClock className="h-3 w-3 mr-1" />
            Coming Soon
          </span>
        )
    }
  }

  const cardContent = (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getCategoryColor()}`}>
          {getCategoryIcon()}
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge()}
          {isExternal && <FiExternalLink className="h-4 w-4 text-gray-400" />}
        </div>
      </div>

      {/* Content */}
      <div className="flex-grow">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          {description}
        </p>

        {/* Features */}
        {features.length > 0 && (
          <div className="mb-4">
            <ul className="space-y-1">
              {features.slice(0, 3).map((feature, index) => (
                <li key={index} className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <FiCheck className="h-3 w-3 mr-2 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action */}
      <div className="mt-auto">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {status === 'coming-soon' ? 'Notify Me' : isExternal ? 'Visit Site' : 'Try Now'}
          </span>
          <div className="flex items-center text-blue-600 dark:text-blue-400">
            {isExternal ? (
              <FiExternalLink className="h-4 w-4" />
            ) : (
              <FiZap className="h-4 w-4" />
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const handleClick = () => {
    if (onClick) {
      onClick()
    }
    
    // Track tool interaction
    const toolId = title.toLowerCase().replace(/\s+/g, '-')
    if (typeof window !== 'undefined') {
      try {
        const history = JSON.parse(localStorage.getItem('anoki_user_tool_history') || '[]')
        history.unshift({
          toolId,
          timestamp: new Date().toISOString()
        })
        localStorage.setItem('anoki_user_tool_history', JSON.stringify(history.slice(0, 10)))
      } catch (error) {
        console.error('Error saving tool interaction:', error)
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 dark:border-gray-700 h-full"
    >
      {status === 'coming-soon' ? (
        <div 
          className="cursor-pointer h-full"
          onClick={handleClick}
        >
          {cardContent}
        </div>
      ) : isExternal ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block h-full hover:no-underline"
          onClick={handleClick}
        >
          {cardContent}
        </a>
      ) : (
        <Link
          href={url}
          className="block h-full hover:no-underline"
          onClick={handleClick}
        >
          {cardContent}
        </Link>
      )}
    </motion.div>
  )
}

export default FeatureCard
