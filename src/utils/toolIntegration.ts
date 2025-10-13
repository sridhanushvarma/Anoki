// Tool Integration System for Anoki
// Handles real API integrations and tool execution

export interface ToolExecutionResult {
  success: boolean
  data?: any
  error?: string
  downloadUrl?: string
  fileName?: string
}

export interface ConversionOptions {
  maintainFormatting?: boolean
  extractImages?: boolean
  pageFrom?: string
  pageTo?: string
  quality?: 'low' | 'medium' | 'high'
}

export interface EnhancementOptions {
  level: 'low' | 'medium' | 'high'
  type: 'image' | 'video' | 'audio' | 'text'
  preserveAspectRatio?: boolean
  denoiseLevel?: number
}

// File Conversion Functions
export class FileConverter {
  static async convertFile(
    file: File, 
    conversionType: string, 
    options: ConversionOptions = {}
  ): Promise<ToolExecutionResult> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('conversionType', conversionType)
      
      // Add options to form data
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value.toString())
        }
      })

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Conversion failed')
      }

      return {
        success: true,
        data: result,
        downloadUrl: result.downloadUrl,
        fileName: result.fileName
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Conversion failed'
      }
    }
  }

  static getSupportedConversions(): Record<string, string[]> {
    return {
      'PDF': ['docx', 'txt', 'html'],
      'DOCX': ['pdf', 'txt', 'html'],
      'JPG': ['png', 'webp', 'gif'],
      'PNG': ['jpg', 'webp', 'gif'],
      'MP4': ['mp3', 'wav', 'avi'],
      'MOV': ['mp4', 'mp3', 'avi']
    }
  }
}

// Quality Enhancement Functions
export class QualityEnhancer {
  static async enhanceFile(
    file: File,
    options: EnhancementOptions
  ): Promise<ToolExecutionResult> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('enhancerType', options.type)
      formData.append('enhancementLevel', options.level)
      
      // Add additional options
      if (options.preserveAspectRatio !== undefined) {
        formData.append('preserveAspectRatio', options.preserveAspectRatio.toString())
      }
      if (options.denoiseLevel !== undefined) {
        formData.append('denoiseLevel', options.denoiseLevel.toString())
      }

      const response = await fetch('/api/enhance', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Enhancement failed')
      }

      return {
        success: true,
        data: result,
        downloadUrl: result.downloadUrl,
        fileName: result.fileName
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Enhancement failed'
      }
    }
  }

  static getEnhancementCapabilities(): Record<string, string[]> {
    return {
      'image': ['upscale', 'denoise', 'sharpen', 'colorize'],
      'video': ['upscale', 'stabilize', 'denoise', 'framerate'],
      'audio': ['denoise', 'enhance', 'normalize', 'clarity'],
      'text': ['grammar', 'style', 'clarity', 'tone']
    }
  }
}

// AI Detection Functions
export class AIDetector {
  static async detectAIContent(
    content: string | File,
    type: 'text' | 'image'
  ): Promise<ToolExecutionResult> {
    try {
      const formData = new FormData()
      
      if (typeof content === 'string') {
        formData.append('content', content)
        formData.append('contentType', 'text')
      } else {
        formData.append('file', content)
        formData.append('contentType', 'file')
      }
      
      formData.append('detectionType', type)

      const response = await fetch('/api/detect', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Detection failed')
      }

      return {
        success: true,
        data: {
          isAIGenerated: result.isAIGenerated,
          confidence: result.confidence,
          details: result.details
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Detection failed'
      }
    }
  }
}

// Tool Chain Executor
export class ToolChainExecutor {
  static async executeChain(
    tools: string[],
    file: File,
    options: Record<string, any> = {}
  ): Promise<ToolExecutionResult[]> {
    const results: ToolExecutionResult[] = []
    let currentFile = file

    for (const toolId of tools) {
      try {
        let result: ToolExecutionResult

        if (toolId.includes('converter')) {
          result = await FileConverter.convertFile(
            currentFile,
            options.conversionType || 'auto',
            options.conversionOptions || {}
          )
        } else if (toolId.includes('enhancer')) {
          result = await QualityEnhancer.enhanceFile(
            currentFile,
            options.enhancementOptions || { level: 'medium', type: 'image' }
          )
        } else if (toolId.includes('detector')) {
          result = await AIDetector.detectAIContent(
            currentFile,
            options.detectionType || 'image'
          )
        } else {
          result = {
            success: false,
            error: `Unknown tool: ${toolId}`
          }
        }

        results.push(result)

        // If this step failed, stop the chain
        if (!result.success) {
          break
        }

        // If this step produced a new file, use it for the next step
        if (result.downloadUrl) {
          // In a real implementation, you would fetch the file from the download URL
          // For now, we'll continue with the original file
        }

      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Tool execution failed'
        })
        break
      }
    }

    return results
  }
}

// Utility Functions
export class ToolUtils {
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  static getFileType(file: File): string {
    const extension = file.name.split('.').pop()?.toLowerCase()
    const mimeType = file.type.toLowerCase()

    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType.startsWith('video/')) return 'video'
    if (mimeType.startsWith('audio/')) return 'audio'
    if (mimeType.includes('pdf')) return 'pdf'
    if (mimeType.includes('document') || mimeType.includes('word')) return 'document'
    if (mimeType.includes('text')) return 'text'

    // Fallback to extension
    if (extension) {
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'image'
      if (['mp4', 'mov', 'avi', 'webm'].includes(extension)) return 'video'
      if (['mp3', 'wav', 'flac'].includes(extension)) return 'audio'
      if (['pdf'].includes(extension)) return 'pdf'
      if (['doc', 'docx'].includes(extension)) return 'document'
      if (['txt', 'md'].includes(extension)) return 'text'
    }

    return 'unknown'
  }

  static validateFile(file: File, allowedTypes: string[], maxSize: number): string | null {
    // Check file size
    if (file.size > maxSize) {
      return `File is too large. Maximum size is ${this.formatFileSize(maxSize)}.`
    }

    // Check file type
    const fileType = this.getFileType(file)
    if (allowedTypes.length > 0 && !allowedTypes.includes(fileType)) {
      return `File type not supported. Allowed types: ${allowedTypes.join(', ')}`
    }

    return null
  }

  static async downloadFile(url: string, filename: string): Promise<void> {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(link.href)
    } catch (error) {
      throw new Error('Download failed')
    }
  }
}
