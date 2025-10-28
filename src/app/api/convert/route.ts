import { NextRequest, NextResponse } from 'next/server'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// Maximum file size (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024

// Supported conversion types
const SUPPORTED_CONVERSIONS = [
  'pdf-to-docx',
  'docx-to-pdf',
  'jpg-to-png',
  'png-to-jpg'
]

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const conversionType = formData.get('conversionType') as string

    // Validate inputs
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!conversionType || !SUPPORTED_CONVERSIONS.includes(conversionType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid conversion type' },
        { status: 400 }
      )
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 50MB.' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileId = uuidv4()
    const originalExtension = file.name.split('.').pop()
    const inputFileName = `${fileId}_input.${originalExtension}`
    
    // Create uploads directory path
    const uploadsDir = join(process.cwd(), 'uploads')
    const inputFilePath = join(uploadsDir, inputFileName)

    // Save uploaded file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    try {
      await writeFile(inputFilePath, buffer)
    } catch (error) {
      console.error('Error saving file:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to save uploaded file' },
        { status: 500 }
      )
    }

    // Perform conversion based on type
    let outputFileName: string = ''
    let outputFilePath: string = ''
    let success = false

    try {
      switch (conversionType) {
        case 'pdf-to-docx':
          outputFileName = `${fileId}_output.docx`
          outputFilePath = join(uploadsDir, outputFileName)
          success = await convertPdfToDocx(inputFilePath, outputFilePath, formData)
          break
          
        case 'docx-to-pdf':
          outputFileName = `${fileId}_output.pdf`
          outputFilePath = join(uploadsDir, outputFileName)
          success = await convertDocxToPdf(inputFilePath, outputFilePath)
          break
          
        case 'jpg-to-png':
          outputFileName = `${fileId}_output.png`
          outputFilePath = join(uploadsDir, outputFileName)
          success = await convertImageFormat(inputFilePath, outputFilePath, 'png')
          break
          
        case 'png-to-jpg':
          outputFileName = `${fileId}_output.jpg`
          outputFilePath = join(uploadsDir, outputFileName)
          success = await convertImageFormat(inputFilePath, outputFilePath, 'jpg')
          break
          
        default:
          throw new Error('Unsupported conversion type')
      }

      if (!success) {
        throw new Error('Conversion failed')
      }

      // Generate download URL
      const downloadUrl = `/api/download/${outputFileName}`
      
      // Clean up input file
      await unlink(inputFilePath)

      // Schedule cleanup of output file after 24 hours
      setTimeout(async () => {
        try {
          await unlink(outputFilePath)
        } catch (error) {
          console.error('Error cleaning up file:', error)
        }
      }, 24 * 60 * 60 * 1000) // 24 hours

      return NextResponse.json({
        success: true,
        downloadUrl,
        fileName: outputFileName,
        originalFileName: file.name,
        conversionType
      })

    } catch (conversionError) {
      console.error('Conversion error:', conversionError)
      
      // Clean up files on error
      try {
        await unlink(inputFilePath)
        if (outputFilePath) {
          await unlink(outputFilePath)
        }
      } catch (cleanupError) {
        console.error('Error cleaning up files:', cleanupError)
      }

      return NextResponse.json(
        { success: false, error: 'Conversion failed. Please try again.' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Conversion functions (these would use actual conversion libraries in production)

async function convertPdfToDocx(inputPath: string, outputPath: string, formData: FormData): Promise<boolean> {
  try {
    const maintainFormatting = formData.get('maintainFormatting') === 'true'
    const extractImages = formData.get('extractImages') === 'true'
    const pageFrom = formData.get('pageFrom')
    const pageTo = formData.get('pageTo')
    
    console.log('Converting PDF to DOCX with options:', {
      maintainFormatting,
      extractImages,
      pageFrom,
      pageTo
    })
    
    // Get the path to the Python script
    const pythonScriptPath = join(process.cwd(), 'pdf_to_docx.py')
    
    // Build command arguments
    const args = []
    if (!maintainFormatting) {
      args.push('--no-maintain-formatting')
    }
    if (!extractImages) {
      args.push('--no-extract-images')
    }
    if (pageFrom) {
      args.push('--page-from', pageFrom.toString())
    }
    if (pageTo) {
      args.push('--page-to', pageTo.toString())
    }
    
    // Execute Python script
    const command = `python3 "${pythonScriptPath}" "${inputPath}" "${outputPath}" ${args.join(' ')}`

    console.log('Executing command:', command)

    const { stdout, stderr } = await execAsync(command, { maxBuffer: 10 * 1024 * 1024 })
    
    if (stderr) {
      console.error('Python script stderr:', stderr)
    }
    
    if (stdout) {
      console.log('Python script stdout:', stdout)
    }
    
    // Check if output file was created
    const fs = require('fs')
    if (!fs.existsSync(outputPath)) {
      console.error('Output file was not created')
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error converting PDF to DOCX:', error)
    return false
  }
}

async function convertDocxToPdf(inputPath: string, outputPath: string): Promise<boolean> {
  // In a real implementation, this would use a library like docx-pdf or LibreOffice
  console.log('Converting DOCX to PDF')
  
  await new Promise(resolve => setTimeout(resolve, 1500))
  await writeFile(outputPath, Buffer.from('Converted PDF content'))
  
  return true
}

async function convertImageFormat(inputPath: string, outputPath: string, format: string): Promise<boolean> {
  // In a real implementation, this would use a library like sharp or jimp
  console.log(`Converting image to ${format}`)
  
  await new Promise(resolve => setTimeout(resolve, 1000))
  await writeFile(outputPath, Buffer.from('Converted image content'))
  
  return true
}
