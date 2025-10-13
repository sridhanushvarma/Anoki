"use client"

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { FiUpload, FiImage, FiVideo, FiX, FiZap, FiDownload, FiExternalLink } from 'react-icons/fi'
import { useDropzone } from 'react-dropzone'
import DownloadProtection from '@/components/DownloadProtection'

type EnhancerType = 'image' | 'video'
type EnhancementLevel = 'low' | 'medium' | 'high'

export default function EnhancersPage() {
  const [enhancerType, setEnhancerType] = useState<EnhancerType>('image')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [enhancementLevel, setEnhancementLevel] = useState<EnhancementLevel>('medium')
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [enhancementComplete, setEnhancementComplete] = useState(false)
  
  const beforeImageRef = useRef<HTMLImageElement>(null)
  const afterImageRef = useRef<HTMLImageElement>(null)
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        handleFileSelect(acceptedFiles[0])
      }
    },
    accept: enhancerType === 'image' 
      ? { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] }
      : { 'video/*': ['.mp4', '.webm', '.mov'] },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: false
  })

  const handleFileSelect = (file: File) => {
    setFile(file)
    const fileUrl = URL.createObjectURL(file)
    setPreview(fileUrl)
    setEnhancementComplete(false)
  }

  const removeFile = () => {
    if (preview) {
      URL.revokeObjectURL(preview)
    }
    setFile(null)
    setPreview(null)
    setEnhancementComplete(false)
  }

  const handleEnhancerTypeChange = (type: EnhancerType) => {
    if (type !== enhancerType) {
      removeFile()
      setEnhancerType(type)
    }
  }

  const handleEnhancementLevelChange = (level: EnhancementLevel) => {
    setEnhancementLevel(level)
  }

  const handleEnhance = async () => {
    if (!file) return

    setIsEnhancing(true)

    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('file', file)
      formData.append('enhancerType', enhancerType)
      formData.append('enhancementLevel', enhancementLevel)

      // Call enhancement API
      const response = await fetch('/api/enhance', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Enhancement failed')
      }

      const result = await response.json()

      if (result.success) {
        setEnhancementComplete(true)
        // Store the enhanced file URL for later use
        sessionStorage.setItem('enhancedFileUrl', result.downloadUrl)
        sessionStorage.setItem('enhancedFileName', result.fileName)
      } else {
        throw new Error(result.error || 'Enhancement failed')
      }
    } catch (error) {
      console.error('Enhancement error:', error)
      alert('Enhancement failed. Please try again.')
    } finally {
      setIsEnhancing(false)
    }
  }

  const resetEnhancer = () => {
    setEnhancementComplete(false)
  }

  const handleDownload = async () => {
    try {
      const downloadUrl = sessionStorage.getItem('enhancedFileUrl')
      const fileName = sessionStorage.getItem('enhancedFileName')

      if (!downloadUrl || !fileName) {
        throw new Error('Download information not found')
      }

      // Create download link
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Clean up session storage
      sessionStorage.removeItem('enhancedFileUrl')
      sessionStorage.removeItem('enhancedFileName')
    } catch (error) {
      console.error('Download error:', error)
      alert('Download failed. Please try enhancing again.')
    }
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
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Quality Enhancers</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Enhance the resolution and quality of your images and videos with AI-powered tools.
          </p>
        </motion.div>
      </section>

      {/* Enhancer Type Selection */}
      <div className="mb-8">
        <div className="flex justify-center space-x-4">
          <button 
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              enhancerType === 'image' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
            onClick={() => handleEnhancerTypeChange('image')}
          >
            <div className="flex items-center">
              <FiImage className="mr-2" />
              Image Enhancer
            </div>
          </button>
          
          <button 
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              enhancerType === 'video' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
            onClick={() => handleEnhancerTypeChange('video')}
          >
            <div className="flex items-center">
              <FiVideo className="mr-2" />
              Video Enhancer
            </div>
          </button>
        </div>
      </div>

      {/* Enhancer Area */}
      <motion.section 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {!file ? (
          <div 
            {...getRootProps()} 
            className={`file-upload-container cursor-pointer ${isDragActive ? 'drag-active' : ''}`}
          >
            <input {...getInputProps()} />
            <FiUpload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-center mb-2">
              Drag and drop your {enhancerType} here, or <span className="text-yellow-600 dark:text-yellow-400">browse</span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Maximum file size: 50MB
            </p>
          </div>
        ) : (
          <div>
            {/* Enhancer Controls */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {enhancerType === 'image' ? 'Image Enhancer' : 'Video Enhancer'}
              </h2>
              <button 
                onClick={removeFile}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 flex items-center"
              >
                <FiX className="mr-1" />
                Remove {enhancerType}
              </button>
            </div>

            {/* Enhancement Options */}
            {!enhancementComplete && (
              <div className="mb-6">
                <h3 className="font-medium mb-3">Enhancement Level:</h3>
                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={() => handleEnhancementLevelChange('low')}
                    className={`px-4 py-2 rounded-md ${
                      enhancementLevel === 'low' 
                        ? 'bg-yellow-600 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    Low (2x)
                  </button>
                  
                  <button 
                    onClick={() => handleEnhancementLevelChange('medium')}
                    className={`px-4 py-2 rounded-md ${
                      enhancementLevel === 'medium' 
                        ? 'bg-yellow-600 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    Medium (4x)
                  </button>
                  
                  <button 
                    onClick={() => handleEnhancementLevelChange('high')}
                    className={`px-4 py-2 rounded-md ${
                      enhancementLevel === 'high' 
                        ? 'bg-yellow-600 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    High (8x)
                  </button>
                </div>
              </div>
            )}

            {/* Preview */}
            {enhancerType === 'image' && (
              <div className={`mb-6 ${enhancementComplete ? 'flex flex-col md:flex-row gap-4' : ''}`}>
                {enhancementComplete ? (
                  <>
                    <div className="flex-1">
                      <p className="text-center mb-2 font-medium">Before</p>
                      <div className="bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
                        <img 
                          ref={beforeImageRef}
                          src={preview || ''} 
                          alt="Before" 
                          className="max-w-full object-contain mx-auto"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-center mb-2 font-medium">After (Enhanced)</p>
                      <div className="bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
                        <img 
                          ref={afterImageRef}
                          src={preview || ''} // In a real app, this would be the enhanced image
                          alt="After" 
                          className="max-w-full object-contain mx-auto"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
                    <div className="flex justify-center p-4">
                      {preview && (
                        <img 
                          src={preview} 
                          alt="Preview" 
                          className="max-w-full max-h-[400px] object-contain"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {enhancerType === 'video' && (
              <div className="mb-6">
                <div className="bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
                  <div className="flex justify-center p-4">
                    {preview && (
                      <video 
                        src={preview} 
                        controls
                        className="max-w-full max-h-[400px]"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="text-center">
              {!enhancementComplete ? (
                <button 
                  onClick={handleEnhance}
                  disabled={isEnhancing}
                  className="px-6 py-3 rounded-lg font-medium bg-yellow-600 hover:bg-yellow-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center">
                    <FiZap className="mr-2" />
                    {isEnhancing ? 'Enhancing...' : `Enhance ${enhancerType}`}
                  </div>
                </button>
              ) : (
                <div className="space-y-3">
                  <DownloadProtection
                    onDownload={handleDownload}
                    downloadText={`Download Enhanced ${enhancerType}`}
                    className="w-full sm:w-auto"
                  />
                  <div>
                    <button 
                      onClick={resetEnhancer}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Enhance another {enhancerType}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.section>

      {/* Recommended Enhancer Services */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Professional Enhancement Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <a 
            href="https://www.upscale.media/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 flex flex-col"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-semibold">Upscale.media</h3>
              <FiExternalLink className="text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              AI image upscaler that enhances and upscales images automatically.
            </p>
            <div className="mt-auto">
              <span className="text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">Free tier available</span>
            </div>
          </a>
          
          <a 
            href="https://letsenhance.io/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 flex flex-col"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-semibold">Let's Enhance</h3>
              <FiExternalLink className="text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Image enhancement platform with multiple AI models for different types of images.
            </p>
            <div className="mt-auto">
              <span className="text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">Free trial</span>
            </div>
          </a>
          
          <a 
            href="https://www.topazlabs.com/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 flex flex-col"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-semibold">Topaz Labs</h3>
              <FiExternalLink className="text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Professional-grade AI-powered software for image and video enhancement.
            </p>
            <div className="mt-auto">
              <span className="text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">Premium</span>
            </div>
          </a>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center">How AI Enhancement Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-yellow-600 dark:text-yellow-400 text-2xl font-bold">1</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Analysis</h3>
            <p className="text-gray-600 dark:text-gray-400">
              AI analyzes your image or video to identify details, patterns, and areas for improvement.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-yellow-600 dark:text-yellow-400 text-2xl font-bold">2</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Processing</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Advanced neural networks predict and generate missing details to increase resolution.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-yellow-600 dark:text-yellow-400 text-2xl font-bold">3</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Enhancement</h3>
            <p className="text-gray-600 dark:text-gray-400">
              The final output is rendered with improved clarity, sharpness, and detail preservation.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
