"use client"

// Route segment configuration
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiUpload, FiFile, FiX } from 'react-icons/fi'
import { useDropzone } from 'react-dropzone'
import DownloadProtection from '@/components/DownloadProtection'

type ConversionType = 'pdf-to-docx' | 'docx-to-pdf' | 'jpg-to-png' | 'png-to-jpg' | 'more'

export default function ConvertersPage() {
  const [selectedConversion, setSelectedConversion] = useState<ConversionType>('pdf-to-docx')
  const [file, setFile] = useState<File | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [conversionComplete, setConversionComplete] = useState(false)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0])
      }
    },
    maxSize: 10485760, // 10MB
    multiple: false
  })

  const handleConversionTypeChange = (type: ConversionType) => {
    setSelectedConversion(type)
  }

  const removeFile = () => {
    setFile(null)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleConvert = async () => {
    if (!file) return

    setIsConverting(true)

    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('file', file)
      formData.append('conversionType', selectedConversion)

      // Add conversion options based on type
      if (selectedConversion === 'pdf-to-docx') {
        const maintainFormatting = document.querySelector('input[name="maintainFormatting"]') as HTMLInputElement
        const extractImages = document.querySelector('input[name="extractImages"]') as HTMLInputElement
        const pageFrom = document.querySelector('input[name="pageFrom"]') as HTMLInputElement
        const pageTo = document.querySelector('input[name="pageTo"]') as HTMLInputElement

        formData.append('maintainFormatting', maintainFormatting?.checked ? 'true' : 'false')
        formData.append('extractImages', extractImages?.checked ? 'true' : 'false')
        if (pageFrom?.value) formData.append('pageFrom', pageFrom.value)
        if (pageTo?.value) formData.append('pageTo', pageTo.value)
      }

      // Call conversion API
      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Conversion failed')
      }

      const result = await response.json()

      if (result.success) {
        setConversionComplete(true)
        // Store the download URL for later use
        sessionStorage.setItem('convertedFileUrl', result.downloadUrl)
        sessionStorage.setItem('convertedFileName', result.fileName)
      } else {
        throw new Error(result.error || 'Conversion failed')
      }
    } catch (error) {
      console.error('Conversion error:', error)
      alert('Conversion failed. Please try again.')
    } finally {
      setIsConverting(false)
    }
  }

  const resetConverter = () => {
    setFile(null)
    setConversionComplete(false)
  }

  const handleDownload = async () => {
    try {
      const downloadUrl = sessionStorage.getItem('convertedFileUrl')
      const fileName = sessionStorage.getItem('convertedFileName')

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
      sessionStorage.removeItem('convertedFileUrl')
      sessionStorage.removeItem('convertedFileName')
    } catch (error) {
      console.error('Download error:', error)
      alert('Download failed. Please try converting again.')
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
          <h1 className="text-3xl md:text-4xl font-bold mb-4">File Converters</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Convert your files between different formats with ease. Simply upload, select conversion type, and download.
          </p>
        </motion.div>
      </section>

      {/* File Converter Tool */}
      <motion.section 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="max-w-3xl mx-auto">
          {!conversionComplete ? (
            <>
              {/* Conversion Type Selection */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Select Conversion Type</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <button 
                    className={`conversion-type-btn rounded-lg p-4 text-center transition-colors ${
                      selectedConversion === 'pdf-to-docx' 
                        ? 'bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800' 
                        : 'bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900'
                    }`}
                    onClick={() => handleConversionTypeChange('pdf-to-docx')}
                  >
                    <span className="block font-medium mb-1">PDF to DOCX</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Convert PDF to Word</span>
                  </button>
                  
                  <button 
                    className={`conversion-type-btn rounded-lg p-4 text-center transition-colors ${
                      selectedConversion === 'docx-to-pdf' 
                        ? 'bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800' 
                        : 'bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900'
                    }`}
                    onClick={() => handleConversionTypeChange('docx-to-pdf')}
                  >
                    <span className="block font-medium mb-1">DOCX to PDF</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Convert Word to PDF</span>
                  </button>
                  
                  <button 
                    className={`conversion-type-btn rounded-lg p-4 text-center transition-colors ${
                      selectedConversion === 'jpg-to-png' 
                        ? 'bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800' 
                        : 'bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900'
                    }`}
                    onClick={() => handleConversionTypeChange('jpg-to-png')}
                  >
                    <span className="block font-medium mb-1">JPG to PNG</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Convert JPG to PNG</span>
                  </button>
                  
                  <button 
                    className={`conversion-type-btn rounded-lg p-4 text-center transition-colors ${
                      selectedConversion === 'png-to-jpg' 
                        ? 'bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800' 
                        : 'bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900'
                    }`}
                    onClick={() => handleConversionTypeChange('png-to-jpg')}
                  >
                    <span className="block font-medium mb-1">PNG to JPG</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Convert PNG to JPG</span>
                  </button>
                  
                  <button 
                    className={`conversion-type-btn rounded-lg p-4 text-center transition-colors ${
                      selectedConversion === 'more' 
                        ? 'bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800' 
                        : 'bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900'
                    }`}
                    onClick={() => handleConversionTypeChange('more')}
                  >
                    <span className="block font-medium mb-1">More Options</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Coming soon</span>
                  </button>
                </div>
              </div>

              {/* File Upload Area */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Upload File</h2>
                {!file ? (
                  <div 
                    {...getRootProps()} 
                    className={`file-upload-container cursor-pointer ${isDragActive ? 'drag-active' : ''}`}
                  >
                    <input {...getInputProps()} />
                    <FiUpload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-center mb-2">
                      Drag and drop your file here, or <span className="text-blue-600 dark:text-blue-400">browse</span>
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                      Maximum file size: 10MB
                    </p>
                  </div>
                ) : (
                  <div className="py-4 px-6 bg-blue-50 dark:bg-blue-900 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <FiFile className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
                        <span className="font-medium">{file.name}</span>
                      </div>
                      <button 
                        onClick={removeFile}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                      >
                        <FiX className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                    </div>
                  </div>
                )}
              </div>

              {/* Conversion Options */}
              {file && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Conversion Options</h2>
                  
                  {selectedConversion === 'pdf-to-docx' && (
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <div className="mb-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="maintainFormatting"
                            className="form-checkbox h-5 w-5 text-blue-600"
                            defaultChecked
                          />
                          <span className="ml-2">Maintain original formatting</span>
                        </label>
                      </div>
                      <div className="mb-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="extractImages"
                            className="form-checkbox h-5 w-5 text-blue-600"
                            defaultChecked
                          />
                          <span className="ml-2">Extract images</span>
                        </label>
                      </div>
                      <div>
                        <label className="block mb-2">Page range (leave empty for all pages)</label>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            name="pageFrom"
                            placeholder="From"
                            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md w-24"
                          />
                          <span className="self-center">-</span>
                          <input
                            type="text"
                            name="pageTo"
                            placeholder="To"
                            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md w-24"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Other conversion options would be added here */}
                </div>
              )}

              {/* Convert Button */}
              <div className="text-center">
                <button 
                  onClick={handleConvert}
                  disabled={!file || isConverting}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConverting ? 'Converting...' : 'Convert File'}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-green-600 dark:text-green-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-2xl font-bold mb-2">Conversion Complete!</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Your file has been successfully converted.</p>
              <div className="mb-4">
                <DownloadProtection
                  onDownload={handleDownload}
                  downloadText="Download Converted File"
                  className="w-full sm:w-auto"
                />
              </div>
              <div>
                <button 
                  onClick={resetConverter}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Convert another file
                </button>
              </div>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Files are automatically deleted from our servers after 24 hours for your privacy.
              </p>
            </div>
          )}
        </div>
      </motion.section>

      {/* Popular Conversion Services */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Popular Online Conversion Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <a 
            href="https://www.ilovepdf.com/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 flex flex-col"
          >
            <h3 className="text-xl font-semibold mb-2">iLovePDF</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Complete suite of PDF tools including merge, split, compress, and convert.
            </p>
            <span className="text-blue-600 dark:text-blue-400 mt-auto">Visit Website →</span>
          </a>
          
          <a 
            href="https://cloudconvert.com/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 flex flex-col"
          >
            <h3 className="text-xl font-semibold mb-2">CloudConvert</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Convert between 200+ formats including documents, images, videos, and audio.
            </p>
            <span className="text-blue-600 dark:text-blue-400 mt-auto">Visit Website →</span>
          </a>
          
          <a 
            href="https://www.zamzar.com/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 flex flex-col"
          >
            <h3 className="text-xl font-semibold mb-2">Zamzar</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Free online file converter supporting a wide range of document, image, and audio formats.
            </p>
            <span className="text-blue-600 dark:text-blue-400 mt-auto">Visit Website →</span>
          </a>
        </div>
      </section>
    </>
  )
}
