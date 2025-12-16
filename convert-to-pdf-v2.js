const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');

async function convertToPDF() {
  console.log('🚀 Starting PDF conversion (multi-page approach)...');
  
  const htmlPath = path.join(__dirname, 'VALIX_PITCH_DECK.html');
  const pdfPath = path.join(__dirname, 'VALIX_PITCH_DECK.pdf');
  
  if (!fs.existsSync(htmlPath)) {
    console.error('❌ HTML file not found:', htmlPath);
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    await page.goto(`file://${htmlPath}`, {
      waitUntil: 'networkidle0',
      timeout: 60000
    });

    await page.waitForSelector('.slide', { timeout: 10000 });
    
    const totalSlides = await page.evaluate(() => {
      return document.querySelectorAll('.slide').length;
    });
    
    console.log(`📄 Found ${totalSlides} slides`);

    // Hide navigation
    await page.evaluate(() => {
      const nav = document.querySelector('.navigation');
      const counter = document.querySelector('.slide-counter');
      const progress = document.querySelector('.progress-bar');
      if (nav) nav.style.display = 'none';
      if (counter) counter.style.display = 'none';
      if (progress) progress.style.display = 'none';
    });

    // Generate PDF for each slide separately
    const pdfBuffers = [];
    
    for (let i = 0; i < totalSlides; i++) {
      console.log(`📄 Processing slide ${i + 1}/${totalSlides}...`);
      
      // Show only current slide
      await page.evaluate((slideIndex) => {
        const slides = document.querySelectorAll('.slide');
        slides.forEach((slide, idx) => {
          if (idx === slideIndex) {
            slide.style.display = 'flex';
            slide.style.opacity = '1';
            slide.style.transform = 'none';
            slide.style.position = 'relative';
            slide.style.height = '100vh';
            slide.style.width = '100%';
          } else {
            slide.style.display = 'none';
          }
        });
        
        // Adjust container
        const container = document.querySelector('.slideshow-container');
        if (container) {
          container.style.height = '100vh';
          container.style.overflow = 'hidden';
        }
      }, i);

      await new Promise(resolve => setTimeout(resolve, 500));

      // Generate PDF for this slide
      const pdfBuffer = await page.pdf({
        format: 'A4',
        landscape: true,
        printBackground: true,
        margin: {
          top: '0mm',
          right: '0mm',
          bottom: '0mm',
          left: '0mm'
        },
        preferCSSPageSize: false,
        displayHeaderFooter: false,
        scale: 1.0
      });

      pdfBuffers.push(pdfBuffer);
    }

    // Merge PDFs using pdf-lib or just concatenate (simpler approach)
    // For now, we'll use a simpler method - generate all slides visible
    console.log('📄 Merging slides into single PDF...');
    
    // Alternative: Generate with all slides visible and proper CSS
    await page.evaluate(() => {
      const slides = document.querySelectorAll('.slide');
      const container = document.querySelector('.slideshow-container');
      
      slides.forEach((slide) => {
        slide.style.display = 'flex';
        slide.style.opacity = '1';
        slide.style.transform = 'none';
        slide.style.position = 'relative';
        slide.style.height = '100vh';
        slide.style.width = '100%';
        slide.style.pageBreakAfter = 'always';
      });
      
      if (container) {
        container.style.height = 'auto';
        container.style.overflow = 'visible';
      }
    });

    await page.addStyleTag({
      content: `
        @page {
          size: A4 landscape;
          margin: 0;
        }
        .slide {
          page-break-after: always !important;
          page-break-inside: avoid !important;
          height: 100vh !important;
          min-height: 100vh !important;
          display: flex !important;
        }
        body {
          margin: 0;
          padding: 0;
        }
      `
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate final PDF
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm'
      },
      preferCSSPageSize: true,
      displayHeaderFooter: false
    });

    console.log('✅ PDF created successfully!');
    console.log(`📁 Location: ${pdfPath}`);
    console.log(`📊 Total slides: ${totalSlides}`);
    
  } catch (error) {
    console.error('❌ Error converting to PDF:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

convertToPDF().catch(console.error);
