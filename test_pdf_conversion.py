#!/usr/bin/env python3
"""
Test script for PDF to DOCX conversion
Tests the conversion with various scenarios and validates output
"""

import os
import sys
import tempfile
import subprocess
from pathlib import Path

# Try to import pdf2docx to create test PDFs
try:
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter
    HAS_REPORTLAB = True
except ImportError:
    HAS_REPORTLAB = False
    print("Warning: reportlab not installed. Cannot create test PDFs.")
    print("Install with: pip3 install reportlab")


def create_test_pdf(output_path, num_pages=3, with_images=False):
    """Create a test PDF file for conversion testing"""
    if not HAS_REPORTLAB:
        print(f"Skipping PDF creation (reportlab not available)")
        return False
    
    try:
        c = canvas.Canvas(output_path, pagesize=letter)
        width, height = letter
        
        for page_num in range(1, num_pages + 1):
            # Add title
            c.setFont("Helvetica-Bold", 24)
            c.drawString(50, height - 50, f"Test PDF - Page {page_num}")
            
            # Add content
            c.setFont("Helvetica", 12)
            y_position = height - 100
            
            content = [
                "This is a test PDF document for conversion testing.",
                f"Page number: {page_num}",
                "",
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
                "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                "",
                "Features tested:",
                "- Text formatting",
                "- Multiple pages",
                "- Paragraph breaks",
                "- Font variations",
            ]
            
            for line in content:
                c.drawString(50, y_position, line)
                y_position -= 20
            
            # Add page number at bottom
            c.setFont("Helvetica", 10)
            c.drawString(width - 100, 30, f"Page {page_num} of {num_pages}")
            
            # Add new page if not the last one
            if page_num < num_pages:
                c.showPage()
        
        c.save()
        print(f"✓ Created test PDF: {output_path}")
        return True
        
    except Exception as e:
        print(f"✗ Error creating test PDF: {str(e)}")
        return False


def test_conversion(input_pdf, output_docx, test_name, **kwargs):
    """Test a single conversion"""
    print(f"\n{'='*60}")
    print(f"Test: {test_name}")
    print(f"{'='*60}")
    
    try:
        # Build command
        cmd = ["python3", "pdf_to_docx.py", input_pdf, output_docx]
        
        # Add options
        if kwargs.get('no_formatting'):
            cmd.append('--no-maintain-formatting')
        if kwargs.get('no_images'):
            cmd.append('--no-extract-images')
        if kwargs.get('page_from'):
            cmd.extend(['--page-from', str(kwargs['page_from'])])
        if kwargs.get('page_to'):
            cmd.extend(['--page-to', str(kwargs['page_to'])])
        
        print(f"Command: {' '.join(cmd)}")
        
        # Run conversion
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        
        # Print output
        if result.stdout:
            print(f"STDOUT:\n{result.stdout}")
        if result.stderr:
            print(f"STDERR:\n{result.stderr}")
        
        # Check result
        if result.returncode == 0:
            if os.path.exists(output_docx):
                file_size = os.path.getsize(output_docx)
                print(f"✓ Conversion successful! Output size: {file_size / 1024:.2f}KB")
                return True
            else:
                print(f"✗ Conversion failed: Output file not created")
                return False
        else:
            print(f"✗ Conversion failed with return code: {result.returncode}")
            return False
            
    except subprocess.TimeoutExpired:
        print(f"✗ Conversion timed out (>60 seconds)")
        return False
    except Exception as e:
        print(f"✗ Error during conversion: {str(e)}")
        return False


def main():
    """Run all tests"""
    print("PDF to DOCX Conversion Test Suite")
    print("=" * 60)
    
    # Create temporary directory for tests
    with tempfile.TemporaryDirectory() as tmpdir:
        results = []
        
        # Test 1: Basic conversion
        test_pdf = os.path.join(tmpdir, "test_basic.pdf")
        test_docx = os.path.join(tmpdir, "test_basic.docx")
        
        if create_test_pdf(test_pdf, num_pages=3):
            result = test_conversion(test_pdf, test_docx, "Basic Conversion (3 pages)")
            results.append(("Basic Conversion", result))
        
        # Test 2: Single page conversion
        test_pdf_single = os.path.join(tmpdir, "test_single.pdf")
        test_docx_single = os.path.join(tmpdir, "test_single.docx")
        
        if create_test_pdf(test_pdf_single, num_pages=1):
            result = test_conversion(test_pdf_single, test_docx_single, "Single Page Conversion")
            results.append(("Single Page Conversion", result))
        
        # Test 3: Page range conversion
        if os.path.exists(test_pdf):
            test_docx_range = os.path.join(tmpdir, "test_range.docx")
            result = test_conversion(
                test_pdf, test_docx_range, 
                "Page Range Conversion (pages 1-2)",
                page_from=1, page_to=2
            )
            results.append(("Page Range Conversion", result))
        
        # Test 4: No formatting
        if os.path.exists(test_pdf):
            test_docx_no_fmt = os.path.join(tmpdir, "test_no_fmt.docx")
            result = test_conversion(
                test_pdf, test_docx_no_fmt,
                "Conversion without formatting preservation",
                no_formatting=True
            )
            results.append(("No Formatting", result))
        
        # Print summary
        print(f"\n{'='*60}")
        print("Test Summary")
        print(f"{'='*60}")
        
        passed = sum(1 for _, result in results if result)
        total = len(results)
        
        for test_name, result in results:
            status = "✓ PASS" if result else "✗ FAIL"
            print(f"{status}: {test_name}")
        
        print(f"\nTotal: {passed}/{total} tests passed")
        
        if passed == total:
            print("\n✓ All tests passed!")
            return 0
        else:
            print(f"\n✗ {total - passed} test(s) failed")
            return 1


if __name__ == '__main__':
    sys.exit(main())

