# How to Share VALIX Pitch Deck

## Quick Options

### Option 1: GitHub Pages (Free & Easy) ⭐ Recommended

1. **Push HTML to GitHub** (if not already):
   ```bash
   git add VALIX_PITCH_DECK.html
   git commit -m "Add pitch deck HTML"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repo: https://github.com/sheik0x/unifiedsecuritylayer
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main` / `root`
   - Save

3. **Access your deck**:
   - URL: `https://sheik0x.github.io/unifiedsecuritylayer/VALIX_PITCH_DECK.html`
   - Share this link!

---

### Option 2: Netlify Drop (Instant)

1. **Go to**: https://app.netlify.com/drop
2. **Drag & drop** `VALIX_PITCH_DECK.html`
3. **Get instant URL** (e.g., `https://random-name-123.netlify.app`)
4. **Share the link!**

---

### Option 3: Vercel (Quick Deploy)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   cd unified-security-layer
   vercel --prod
   ```

3. **Share the URL** Vercel provides

---

### Option 4: Static Hosting Services

**Surge.sh** (Free):
```bash
npm install -g surge
surge VALIX_PITCH_DECK.html your-name.surge.sh
```

**Firebase Hosting** (Free):
```bash
npm install -g firebase-tools
firebase init hosting
# Copy VALIX_PITCH_DECK.html to public/
firebase deploy
```

---

### Option 5: Cloud Storage (Public Link)

**Google Drive**:
1. Upload `VALIX_PITCH_DECK.html` to Google Drive
2. Right-click → Share → Get link
3. Change link to: `https://drive.google.com/uc?export=download&id=FILE_ID`
4. Or use: `https://docs.google.com/viewer?url=YOUR_FILE_URL`

**Dropbox**:
1. Upload file to Dropbox
2. Right-click → Copy link
3. Change `dl=0` to `dl=1` in URL

**OneDrive**:
1. Upload to OneDrive
2. Right-click → Embed → Get embed code
3. Extract direct link

---

### Option 6: Email as Attachment

Simply attach `VALIX_PITCH_DECK.html` to an email. Recipients can open it in their browser.

---

## Best Practices

### For Professional Sharing:

1. **Use GitHub Pages** - Most professional, permanent URL
2. **Custom Domain** (optional) - `pitch.valix.io`
3. **Short URL** - Use bit.ly or tinyurl for cleaner links

### For Quick Sharing:

1. **Netlify Drop** - Fastest, no setup
2. **Email Attachment** - Works for small audiences

---

## Quick Deploy Script

Run this to deploy automatically:

```bash
npm run deploy-pitch-deck
```

(We'll create this script next)

---

## Recommended: GitHub Pages

**Why GitHub Pages?**
- ✅ Free forever
- ✅ Permanent URL
- ✅ Professional (yourname.github.io)
- ✅ Easy to update (just push changes)
- ✅ Works with custom domains

**Setup Time**: 2 minutes
**Maintenance**: Zero (auto-updates on git push)

---

## Shareable Links Format

Once hosted, your deck will be accessible at:
- `https://sheik0x.github.io/unifiedsecuritylayer/VALIX_PITCH_DECK.html`
- Or your custom domain: `https://pitch.valix.io`

Share this link with investors, partners, or team members!
