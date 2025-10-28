"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiUpload, FiDownload, FiZap, FiLoader } from 'react-icons/fi'
import { useDropzone } from 'react-dropzone'

export default function ImageEnhancerPage() {
  const [image, setImage] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('')
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [enhancementLevel, setEnhancementLevel] = useState<'low' | 'medium' | 'high'>('medium')

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        setFileName(file.name)
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          setImage(result)
          setEnhancedImage(null)
        }
        reader.readAsDataURL(file)
      }
    },
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] },
    multiple: false,
  })

  const handleEnhance = async () => {
    if (!image) return

    setIsEnhancing(true)
    try {
      // Convert data URL to blob
      const response = await fetch(image)
      const blob = await response.blob()
      
      // Create FormData
      const formData = new FormData()
      formData.append('file', blob, fileName)
      formData.append('enhancerType', 'image')
      formData.append('enhancementLevel', enhancementLevel)

      // Call enhancement API
      const enhanceResponse = await fetch('/api/enhance', {
        method: 'POST',
        body: formData,
      })

      if (!enhanceResponse.ok) {
        throw new Error('Enhancement failed')
      }

      const result = await enhanceResponse.json()
      
      // For demo purposes, we'll simulate the enhancement
      // In production, you would fetch the enhanced image from the server
      setTimeout(() => {
        setEnhancedImage(image) // In real implementation, use result.downloadUrl
        setIsEnhancing(false)
      }, 2000)
    } catch (error) {
      console.error('Enhancement error:', error)
      alert('Enhancement failed. Please try again.')
      setIsEnhancing(false)
    }
  }

  const handleDownload = () => {
    if (enhancedImage) {
      const link = document.createElement('a')
      link.href = enhancedImage
      link.download = `enhanced-${fileName}`
      link.click()
    }
  }

  const handleReset = () => {
    setImage(null)
    setFileName('')
    setEnhancedImage(null)
    setEnhancementLevel('medium')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">Image Enhancer</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Enhance your images with AI-powered upscaling, denoising, and sharpening.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Original Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold mb-6">Original Image</h2>
            {!image ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                }`}
              >
                <input {...getInputProps()} />
                <FiUpload className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-semibold mb-2">
                  Drag and drop your image here
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  or click to browse
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg overflow-auto max-h-96 flex items-center justify-center">
                  <img
                    src={image}
                    alt="Original"
                    className="max-w-full max-h-96 object-contain"
                  />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {fileName}
                </p>
              </div>
            )}
          </motion.div>

          {/* Enhanced Image */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold mb-6">Enhanced Image</h2>
            {!enhancedImage ? (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center">
                <FiZap className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  {image ? 'Click "Enhance" to process your image' : 'Upload an image first'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg overflow-auto max-h-96 flex items-center justify-center">
                  <img
                    src={enhancedImage}
                    alt="Enhanced"
                    className="max-w-full max-h-96 object-contain"
                  />
                </div>
                <button
                  onClick={handleDownload}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-md transition-colors flex items-center justify-center gap-2"
                >
                  <FiDownload size={20} />
                  Download Enhanced Image
                </button>
              </div>
            )}
          </motion.div>
        </div>

        {/* Controls */}
        {image && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold mb-6">Enhancement Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Enhancement Level
                </label>
                <select
                  value={enhancementLevel}
                  onChange={(e) => setEnhancementLevel(e.target.value as 'low' | 'medium' | 'high')}
                  disabled={isEnhancing}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="low">Low (2x upscale)</option>
                  <option value="medium">Medium (4x upscale)</option>
                  <option value="high">High (8x upscale)</option>
                </select>
              </div>

              <button
                onClick={handleEnhance}
                disabled={isEnhancing || enhancedImage !== null}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-md transition-colors flex items-center justify-center gap-2 self-end"
              >
                {isEnhancing ? (
                  <>
                    <FiLoader className="animate-spin" size={20} />
                    Enhancing...
                  </>
                ) : (
                  <>
                    <FiZap size={20} />
                    Enhance Image
                  </>
                )}
              </button>

              <button
                onClick={handleReset}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 rounded-md transition-colors self-end"
              >
                Reset
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

