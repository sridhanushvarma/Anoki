"use client"

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiUpload, FiImage, FiVideo, FiX, FiCrop, FiRotateCw, FiZoomIn, FiZoomOut, FiSave } from 'react-icons/fi'
import { useDropzone } from 'react-dropzone'
import DownloadProtection from '@/components/DownloadProtection'

type EditorType = 'image' | 'video'
type ImageEditMode = 'crop' | 'resize' | 'rotate' | 'none'

export default function EditorsPage() {
  const [editorType, setEditorType] = useState<EditorType>('image')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [imageEditMode, setImageEditMode] = useState<ImageEditMode>('none')
  const [edited, setEdited] = useState(false)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        handleFileSelect(acceptedFiles[0])
      }
    },
    accept: editorType === 'image' 
      ? { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] }
      : { 'video/*': ['.mp4', '.webm', '.mov'] },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: false
  })

  const handleFileSelect = (file: File) => {
    setFile(file)
    const fileUrl = URL.createObjectURL(file)
    setPreview(fileUrl)
    setImageEditMode('none')
    setEdited(false)
  }

  const removeFile = () => {
    if (preview) {
      URL.revokeObjectURL(preview)
    }
    setFile(null)
    setPreview(null)
    setImageEditMode('none')
    setEdited(false)
  }

  const handleEditorTypeChange = (type: EditorType) => {
    if (type !== editorType) {
      removeFile()
      setEditorType(type)
    }
  }

  const handleImageEditMode = (mode: ImageEditMode) => {
    setImageEditMode(mode)
  }

  const handleSaveImage = async () => {
    if (!canvasRef.current || !preview || !imageRef.current) return

    try {
      const canvas = canvasRef.current
      const image = imageRef.current
      const ctx = canvas.getContext('2d')

      if (!ctx) return

      // Set canvas dimensions to match image
      canvas.width = image.naturalWidth
      canvas.height = image.naturalHeight

      // Apply the current edit mode
      switch (imageEditMode) {
        case 'rotate':
          // Rotate 90 degrees clockwise
          ctx.translate(canvas.width / 2, canvas.height / 2)
          ctx.rotate(Math.PI / 2)
          ctx.drawImage(image, -image.naturalHeight / 2, -image.naturalWidth / 2, image.naturalHeight, image.naturalWidth)
          break

        case 'crop':
          // Simple center crop (in real implementation, this would use user selection)
          const cropSize = Math.min(image.naturalWidth, image.naturalHeight)
          const cropX = (image.naturalWidth - cropSize) / 2
          const cropY = (image.naturalHeight - cropSize) / 2
          canvas.width = cropSize
          canvas.height = cropSize
          ctx.drawImage(image, cropX, cropY, cropSize, cropSize, 0, 0, cropSize, cropSize)
          break

        case 'resize':
          // Get resize values from inputs
          const widthInput = document.querySelector('input[placeholder="Width"]') as HTMLInputElement
          const heightInput = document.querySelector('input[placeholder="Height"]') as HTMLInputElement
          const newWidth = parseInt(widthInput?.value) || image.naturalWidth
          const newHeight = parseInt(heightInput?.value) || image.naturalHeight
          canvas.width = newWidth
          canvas.height = newHeight
          ctx.drawImage(image, 0, 0, newWidth, newHeight)
          break

        default:
          ctx.drawImage(image, 0, 0)
      }

      // Convert canvas to blob and create new preview
      canvas.toBlob((blob) => {
        if (blob) {
          const newPreviewUrl = URL.createObjectURL(blob)
          if (preview) {
            URL.revokeObjectURL(preview)
          }
          setPreview(newPreviewUrl)
          setEdited(true)
          setImageEditMode('none')
        }
      }, 'image/png')

    } catch (error) {
      console.error('Error saving image:', error)
      alert('Failed to save image edits')
    }
  }

  const handleDownloadImage = () => {
    if (!canvasRef.current) return

    try {
      // Create download link from canvas
      const canvas = canvasRef.current
      const link = document.createElement('a')
      link.download = `edited_${file?.name || 'image'}.png`
      link.href = canvas.toDataURL('image/png')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download edited image')
    }
  }

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview])

  return (
    <>
      {/* Page Header */}
      <section className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Image & Video Editors</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Edit your images and videos with simple tools. All processing happens locally on your device.
          </p>
        </motion.div>
      </section>

      {/* Editor Type Selection */}
      <div className="mb-8">
        <div className="flex justify-center space-x-4">
          <button 
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              editorType === 'image' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
            onClick={() => handleEditorTypeChange('image')}
          >
            <div className="flex items-center">
              <FiImage className="mr-2" />
              Image Editor
            </div>
          </button>
          
          <button 
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              editorType === 'video' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
            onClick={() => handleEditorTypeChange('video')}
          >
            <div className="flex items-center">
              <FiVideo className="mr-2" />
              Video Editor
            </div>
          </button>
        </div>
      </div>

      {/* Editor Area */}
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
              Drag and drop your {editorType} here, or <span className="text-purple-600 dark:text-purple-400">browse</span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Maximum file size: 50MB
            </p>
          </div>
        ) : (
          <div>
            {/* Editor Controls */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editorType === 'image' ? 'Image Editor' : 'Video Editor'}
              </h2>
              <button 
                onClick={removeFile}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 flex items-center"
              >
                <FiX className="mr-1" />
                Remove {editorType}
              </button>
            </div>

            {/* Image Editor */}
            {editorType === 'image' && (
              <>
                <div className="mb-4 flex flex-wrap gap-2">
                  <button 
                    onClick={() => handleImageEditMode('crop')}
                    className={`px-4 py-2 rounded-md flex items-center ${
                      imageEditMode === 'crop' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    <FiCrop className="mr-2" />
                    Crop
                  </button>
                  
                  <button 
                    onClick={() => handleImageEditMode('rotate')}
                    className={`px-4 py-2 rounded-md flex items-center ${
                      imageEditMode === 'rotate' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    <FiRotateCw className="mr-2" />
                    Rotate
                  </button>
                  
                  <button 
                    onClick={() => handleImageEditMode('resize')}
                    className={`px-4 py-2 rounded-md flex items-center ${
                      imageEditMode === 'resize' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    <FiZoomIn className="mr-2" />
                    Resize
                  </button>
                </div>

                {/* Image Preview */}
                <div className="relative bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden mb-4">
                  <div className="flex justify-center p-4">
                    {preview && (
                      <img 
                        ref={imageRef}
                        src={preview} 
                        alt="Preview" 
                        className="max-w-full max-h-[500px] object-contain"
                      />
                    )}
                    <canvas ref={canvasRef} className="hidden"></canvas>
                  </div>
                </div>

                {/* Image Edit Controls */}
                {imageEditMode !== 'none' && (
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-4">
                    {imageEditMode === 'crop' && (
                      <div className="text-center">
                        <p className="mb-2">Drag to select crop area</p>
                        <div className="flex justify-center space-x-2">
                          <button className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded">1:1</button>
                          <button className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded">4:3</button>
                          <button className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded">16:9</button>
                          <button className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded">Free</button>
                        </div>
                      </div>
                    )}

                    {imageEditMode === 'rotate' && (
                      <div className="text-center">
                        <p className="mb-2">Rotate image</p>
                        <div className="flex justify-center space-x-4">
                          <button className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                            <FiRotateCw className="transform -rotate-90" />
                          </button>
                          <button className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                            <FiRotateCw />
                          </button>
                          <button className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                            <FiRotateCw className="transform rotate-90" />
                          </button>
                        </div>
                      </div>
                    )}

                    {imageEditMode === 'resize' && (
                      <div className="text-center">
                        <p className="mb-2">Resize image</p>
                        <div className="flex justify-center items-center space-x-2">
                          <input 
                            type="number" 
                            placeholder="Width" 
                            className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
                          />
                          <span>×</span>
                          <input 
                            type="number" 
                            placeholder="Height" 
                            className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
                          />
                          <label className="flex items-center ml-2">
                            <input type="checkbox" className="mr-1" defaultChecked />
                            <span>Maintain aspect ratio</span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="text-center space-y-3">
                  {imageEditMode !== 'none' && (
                    <button
                      onClick={handleSaveImage}
                      className="px-6 py-3 rounded-lg font-medium bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
                    >
                      <div className="flex items-center justify-center">
                        <FiSave className="mr-2" />
                        Apply Changes
                      </div>
                    </button>
                  )}

                  {edited && (
                    <div className="w-full sm:w-auto">
                      <DownloadProtection
                        onDownload={handleDownloadImage}
                        downloadText="Download Edited Image"
                        className="w-full sm:w-auto"
                      />
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Video Editor */}
            {editorType === 'video' && (
              <div className="text-center py-8">
                <FiVideo className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-medium mb-2">Video Editor Coming Soon</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  We're working hard to bring you video editing capabilities.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  In the meantime, check out our recommended video editing tools below.
                </p>
              </div>
            )}
          </div>
        )}
      </motion.section>

      {/* Recommended Tools */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Recommended Editing Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <a 
            href="https://www.canva.com/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 flex flex-col"
          >
            <h3 className="text-xl font-semibold mb-2">Canva</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Easy-to-use graphic design platform with powerful image editing capabilities.
            </p>
            <span className="text-blue-600 dark:text-blue-400 mt-auto">Visit Website →</span>
          </a>
          
          <a 
            href="https://www.photopea.com/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 flex flex-col"
          >
            <h3 className="text-xl font-semibold mb-2">Photopea</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Free online photo editor supporting PSD, XCF, Sketch, XD and CDR formats.
            </p>
            <span className="text-blue-600 dark:text-blue-400 mt-auto">Visit Website →</span>
          </a>
          
          <a 
            href="https://www.kapwing.com/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 flex flex-col"
          >
            <h3 className="text-xl font-semibold mb-2">Kapwing</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Modern video editing, collaboration, and creation platform.
            </p>
            <span className="text-blue-600 dark:text-blue-400 mt-auto">Visit Website →</span>
          </a>
        </div>
      </section>
    </>
  )
}
