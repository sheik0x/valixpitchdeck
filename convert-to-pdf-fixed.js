const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

async function convertToPDF() {
  console.log('🚀 Starting PDF conversion (one page per slide)...');
  
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

    // Hide navigation elements
    await page.evaluate(() => {
      const nav = document.querySelector('.navigation');
      const counter = document.querySelector('.slide-counter');
      const progress = document.querySelector('.progress-bar');
      if (nav) nav.style.display = 'none';
      if (counter) counter.style.display = 'none';
      if (progress) progress.style.display = 'none';
    });

    const pdfDoc = await PDFDocument.create();
    const pdfPages = [];

    // Generate each slide as a separate PDF page
    for (let i = 0; i < totalSlides; i++) {
      console.log(`📄 Processing slide ${i + 1}/${totalSlides}...`);
      
      // Show only current slide and make it fill the viewport
      await page.evaluate((slideIndex) => {
        const slides = document.querySelectorAll('.slide');
        const container = document.querySelector('.slideshow-container');
        
        slides.forEach((slide, idx) => {
          if (idx === slideIndex) {
            slide.style.display = 'flex';
            slide.style.opacity = '1';
            slide.style.transform = 'none';
            slide.style.position = 'fixed';
            slide.style.top = '0';
            slide.style.left = '0';
            slide.style.width = '100vw';
            slide.style.height = '100vh';
            slide.style.zIndex = '1000';
          } else {
            slide.style.display = 'none';
          }
        });
        
        if (container) {
          container.style.height = '100vh';
          container.style.width = '100vw';
          container.style.overflow = 'hidden';
        }
        
        document.body.style.overflow = 'hidden';
      }, i);

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate PDF for this single slide
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

      // Load this PDF page into pdf-lib
      const slidePdf = await PDFDocument.load(pdfBuffer);
      const [slidePage] = await pdfDoc.copyPages(slidePdf, [0]);
      pdfDoc.addPage(slidePage);
    }

    // Save the merged PDF
    const finalPdfBytes = await pdfDoc.save();
    fs.writeFileSync(pdfPath, finalPdfBytes);

    console.log('✅ PDF created successfully!');
    console.log(`📁 Location: ${pdfPath}`);
    console.log(`📊 Total pages: ${totalSlides}`);
    
  } catch (error) {
    console.error('❌ Error converting to PDF:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

convertToPDF().catch(console.error);
