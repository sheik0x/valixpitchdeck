# Export VALIX Pitch Deck to PDF

## Method 1: Browser Print to PDF (Easiest - Recommended)

### Steps:

1. **Open the HTML file** in your browser:
   - Double-click `VALIX_PITCH_DECK.html`
   - Or right-click → Open with → Your browser

2. **Open Print Dialog**:
   - Press `Ctrl + P` (Windows) or `Cmd + P` (Mac)
   - Or go to Menu → Print

3. **Configure Print Settings**:
   - **Destination**: Select "Save as PDF" or "Microsoft Print to PDF"
   - **Layout**: Landscape
   - **Paper Size**: A4 or Letter
   - **Margins**: Default or Minimum
   - **Options**: 
     - ✅ Check "Background graphics" (to include colors)
     - ✅ Check "Headers and footers" (optional)

4. **Save**:
   - Click "Save" or "Print"
   - Choose location and filename (e.g., `VALIX_PITCH_DECK.pdf`)

### Tips:
- Navigate through all slides first to ensure they're loaded
- Use Chrome/Edge for best results
- Each slide will be on a separate page

---

## Method 2: Using Node.js Script (Automated)

### Prerequisites:
```bash
npm install puppeteer
```

### Run:
```bash
node convert-to-pdf.js
```

This will create `VALIX_PITCH_DECK.pdf` automatically.

---

## Method 3: Online HTML to PDF Converters

1. Upload `VALIX_PITCH_DECK.html` to:
   - https://www.ilovepdf.com/html-to-pdf
   - https://www.sejda.com/html-to-pdf
   - https://www.pdf24.org/en/html-to-pdf

2. Configure:
   - Landscape orientation
   - A4 size
   - Include backgrounds

3. Download the PDF

---

## Method 4: Using Python (Alternative)

If you have Python installed:

```bash
pip install weasyprint
python convert-to-pdf.py
```

---

## Recommended Settings for Best Results

- **Orientation**: Landscape
- **Paper Size**: A4 or Letter
- **Margins**: 20mm (or Default)
- **Scale**: 100% (or Auto)
- **Background Graphics**: Enabled
- **Headers/Footers**: Disabled (for clean slides)

---

## File Location

After export, your PDF will be saved as:
- `VALIX_PITCH_DECK.pdf` (in the same directory as the HTML file)

---

**Note**: The HTML file is designed to work best with Chrome/Edge browsers for PDF export. Each slide will automatically be on a separate page when printed.
