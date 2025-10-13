"use client"

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { FiUpload, FiFile, FiX, FiCheck, FiAlertCircle, FiImage, FiVideo, FiFileText } from 'react-icons/fi'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  onFileRemove: () => void
  acceptedFileTypes?: Record<string, string[]>
  maxSize?: number
  currentFile?: File | null
  disabled?: boolean
  multiple?: boolean
  className?: string
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onFileRemove,
  acceptedFileTypes = { '*': [] },
  maxSize = 50 * 1024 * 1024, // 50MB default
  currentFile = null,
  disabled = false,
  multiple = false,
  className = ''
}) => {
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setUploadError(null)

    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0]
      if (rejection.errors[0]?.code === 'file-too-large') {
        setUploadError(`File is too large. Maximum size is ${formatFileSize(maxSize)}.`)
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setUploadError('File type not supported.')
      } else {
        setUploadError('File upload failed. Please try again.')
      }
      return
    }

    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0])
    }
  }, [onFileSelect, maxSize])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxSize,
    multiple,
    disabled: disabled || !!currentFile,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false)
  })

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (file: File) => {
    const type = file.type.toLowerCase()
    if (type.startsWith('image/')) {
      return <FiImage className="h-6 w-6 text-blue-600 dark:text-blue-400" />
    } else if (type.startsWith('video/')) {
      return <FiVideo className="h-6 w-6 text-purple-600 dark:text-purple-400" />
    } else if (type.includes('pdf') || type.includes('document') || type.includes('text')) {
      return <FiFileText className="h-6 w-6 text-red-600 dark:text-red-400" />
    } else {
      return <FiFile className="h-6 w-6 text-gray-600 dark:text-gray-400" />
    }
  }

  const getAcceptedFormats = () => {
    const formats = Object.values(acceptedFileTypes).flat()
    if (formats.length === 0) return 'All file types'
    return formats.join(', ').toUpperCase()
  }

  const handleRemoveFile = () => {
    setUploadError(null)
    onFileRemove()
  }

  return (
    <div className={`w-full ${className}`}>
      <AnimatePresence>
        {!currentFile ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div
              {...getRootProps()}
              className={`
                relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300
                ${isDragActive || dragActive
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input {...getInputProps()} />
              
              <motion.div
                animate={{ 
                  scale: isDragActive ? 1.1 : 1,
                  rotate: isDragActive ? 5 : 0
                }}
                transition={{ duration: 0.2 }}
              >
                <FiUpload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              </motion.div>

              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {isDragActive ? 'Drop your file here' : 'Upload your file'}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Drag and drop your file here, or{' '}
                <span className="text-blue-600 dark:text-blue-400 font-medium">browse</span>
              </p>

              <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                <p>Supported formats: {getAcceptedFormats()}</p>
                <p>Maximum file size: {formatFileSize(maxSize)}</p>
              </div>

              {/* Upload animation overlay */}
              <AnimatePresence>
                {isDragActive && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-blue-500/10 rounded-xl flex items-center justify-center"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="text-blue-600 dark:text-blue-400"
                    >
                      <FiUpload className="h-16 w-16" />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {getFileIcon(currentFile)}
                </div>
                <div className="flex-grow min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {currentFile.name}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatFileSize(currentFile.size)} • {currentFile.type || 'Unknown type'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex-shrink-0">
                  <FiCheck className="h-5 w-5 text-green-500" />
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="flex-shrink-0 p-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                  title="Remove file"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error message */}
      <AnimatePresence>
        {uploadError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <div className="flex items-center">
              <FiAlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
              <p className="text-sm text-red-800 dark:text-red-200">{uploadError}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FileUpload
