#!/usr/bin/env python3
"""
PDF to DOCX Converter Script
This script converts PDF files to DOCX format using pdf2docx library.
"""

import sys
import os
from pdf2docx import convert
from pathlib import Path


def convert_pdf_to_docx(input_path, output_path, maintain_formatting=True, extract_images=True, page_from=None, page_to=None):
    """
    Convert PDF to DOCX
    
    Args:
        input_path (str): Path to input PDF file
        output_path (str): Path to output DOCX file
        maintain_formatting (bool): Whether to maintain original formatting
        extract_images (bool): Whether to extract images from PDF
        page_from (int): Start page (1-indexed), None for first page
        page_to (int): End page (1-indexed), None for last page
    
    Returns:
        bool: True if conversion successful, False otherwise
    """
    try:
        # Validate input file
        if not os.path.exists(input_path):
            print(f"Error: Input file '{input_path}' does not exist", file=sys.stderr)
            return False
        
        if not input_path.lower().endswith('.pdf'):
            print("Error: Input file must be a PDF", file=sys.stderr)
            return False
        
        # Create output directory if it doesn't exist
        output_dir = os.path.dirname(output_path)
        if output_dir and not os.path.exists(output_dir):
            os.makedirs(output_dir)
        
        # Convert PDF to DOCX
        print(f"Converting '{input_path}' to '{output_path}'...", file=sys.stderr)
        
        # Page range handling
        pages = None
        if page_from is not None or page_to is not None:
            # pdf2docx uses 0-indexed pages
            start_page = (page_from - 1) if page_from else None
            end_page = page_to if page_to else None
            
            if start_page is not None:
                pages = (start_page, end_page)
        
        # Perform conversion
        convert(
            input_path,
            output_path,
            start=pages[0] if pages and pages[0] is not None else None,
            end=pages[1] if pages and pages[1] is not None else None,
            layout=maintain_formatting  # preserve_layout parameter
        )
        
        print(f"Conversion completed successfully!", file=sys.stderr)
        return True
        
    except Exception as e:
        print(f"Error during conversion: {str(e)}", file=sys.stderr)
        return False


def main():
    """Main entry point for the script"""
    if len(sys.argv) < 3:
        print("Usage: python pdf_to_docx.py <input_pdf> <output_docx> [options]", file=sys.stderr)
        print("\nOptions:", file=sys.stderr)
        print("  --no-maintain-formatting  Don't maintain original formatting", file=sys.stderr)
        print("  --no-extract-images       Don't extract images", file=sys.stderr)
        print("  --page-from N             Start page (1-indexed)", file=sys.stderr)
        print("  --page-to N               End page (1-indexed)", file=sys.stderr)
        sys.exit(1)
    
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    
    # Parse options
    maintain_formatting = True
    extract_images = True
    page_from = None
    page_to = None
    
    i = 3
    while i < len(sys.argv):
        arg = sys.argv[i]
        
        if arg == '--no-maintain-formatting':
            maintain_formatting = False
        elif arg == '--no-extract-images':
            extract_images = False
        elif arg == '--page-from':
            i += 1
            if i < len(sys.argv):
                page_from = int(sys.argv[i])
            else:
                print("Error: --page-from requires a page number", file=sys.stderr)
                sys.exit(1)
        elif arg == '--page-to':
            i += 1
            if i < len(sys.argv):
                page_to = int(sys.argv[i])
            else:
                print("Error: --page-to requires a page number", file=sys.stderr)
                sys.exit(1)
        
        i += 1
    
    # Perform conversion
    success = convert_pdf_to_docx(
        input_path,
        output_path,
        maintain_formatting=maintain_formatting,
        extract_images=extract_images,
        page_from=page_from,
        page_to=page_to
    )
    
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
