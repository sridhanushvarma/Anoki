"use client"

// Route segment configuration
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { FiUpload, FiDownload, FiRotateCw, FiCrop, FiZoomIn, FiZoomOut } from 'react-icons/fi'
import { useDropzone } from 'react-dropzone'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'

export default function ImageEditorPage() {
  const [image, setImage] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('')
  const [cropper, setCropper] = useState<Cropper | null>(null)
  const [rotation, setRotation] = useState(0)
  const [zoom, setZoom] = useState(1)
  const imageRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        setFileName(file.name)
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          setImage(result)
          setRotation(0)
          setZoom(1)
        }
        reader.readAsDataURL(file)
      }
    },
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] },
    multiple: false,
  })

  const initializeCropper = () => {
    if (imageRef.current && !cropper) {
      const newCropper = new Cropper(imageRef.current, {
        aspectRatio: NaN,
        autoCropArea: 1,
        responsive: true,
        restore: true,
        guides: true,
        center: true,
        highlight: true,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: true,
      })
      setCropper(newCropper)
    }
  }

  const handleRotate = () => {
    const newRotation = (rotation + 90) % 360
    setRotation(newRotation)
    if (cropper) {
      cropper.rotate(90)
    }
  }

  const handleZoom = (direction: 'in' | 'out') => {
    const newZoom = direction === 'in' ? zoom + 0.1 : Math.max(0.1, zoom - 0.1)
    setZoom(newZoom)
    if (cropper) {
      cropper.zoomTo(newZoom)
    }
  }

  const handleDownload = () => {
    if (cropper) {
      const canvas = cropper.getCroppedCanvas()
      const link = document.createElement('a')
      link.href = canvas.toDataURL()
      link.download = `edited-${fileName}`
      link.click()
    } else if (image) {
      const link = document.createElement('a')
      link.href = image
      link.download = `edited-${fileName}`
      link.click()
    }
  }

  const handleReset = () => {
    setImage(null)
    setFileName('')
    setRotation(0)
    setZoom(1)
    if (cropper) {
      cropper.destroy()
      setCropper(null)
    }
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
          <h1 className="text-4xl font-bold mb-4">Image Editor</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Edit your images with powerful tools like crop, rotate, and zoom.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Editor Area */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8"
          >
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
                    ref={imageRef}
                    src={image}
                    alt="Editor"
                    className="max-w-full max-h-96"
                    onLoad={initializeCropper}
                  />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {fileName}
                </p>
              </div>
            )}
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold mb-6">Tools</h2>

            {image && (
              <div className="space-y-4">
                <button
                  onClick={handleRotate}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition-colors flex items-center justify-center gap-2"
                >
                  <FiRotateCw size={20} />
                  Rotate 90°
                </button>

                <button
                  onClick={() => handleZoom('in')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-md transition-colors flex items-center justify-center gap-2"
                >
                  <FiZoomIn size={20} />
                  Zoom In
                </button>

                <button
                  onClick={() => handleZoom('out')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-md transition-colors flex items-center justify-center gap-2"
                >
                  <FiZoomOut size={20} />
                  Zoom Out
                </button>

                <button
                  onClick={handleDownload}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-md transition-colors flex items-center justify-center gap-2"
                >
                  <FiDownload size={20} />
                  Download
                </button>

                <button
                  onClick={handleReset}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-md transition-colors"
                >
                  Reset
                </button>
              </div>
            )}

            {!image && (
              <p className="text-gray-600 dark:text-gray-400 text-center">
                Upload an image to get started
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

