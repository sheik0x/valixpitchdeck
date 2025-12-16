#!/usr/bin/env node

/**
 * Deploy VALIX Pitch Deck to various hosting platforms
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const htmlFile = path.join(__dirname, 'VALIX_PITCH_DECK.html');

console.log('🚀 VALIX Pitch Deck Deployment Tool\n');

if (!fs.existsSync(htmlFile)) {
  console.error('❌ VALIX_PITCH_DECK.html not found!');
  process.exit(1);
}

console.log('Available deployment options:\n');
console.log('1. GitHub Pages (Recommended)');
console.log('2. Netlify Drop (Fastest)');
console.log('3. Vercel');
console.log('4. Surge.sh');
console.log('5. Create shareable package\n');

// For now, provide instructions
console.log('📋 Quick Instructions:\n');

console.log('GitHub Pages:');
console.log('  1. git add VALIX_PITCH_DECK.html');
console.log('  2. git commit -m "Add pitch deck"');
console.log('  3. git push origin main');
console.log('  4. Enable GitHub Pages in repo settings\n');

console.log('Netlify Drop:');
console.log('  1. Go to: https://app.netlify.com/drop');
console.log('  2. Drag VALIX_PITCH_DECK.html');
console.log('  3. Get instant URL!\n');

console.log('Vercel:');
console.log('  1. npm install -g vercel');
console.log('  2. vercel --prod\n');

console.log('✅ File ready for deployment!');
console.log(`📁 Location: ${htmlFile}`);
