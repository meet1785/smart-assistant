# Extension Loading and Testing Guide

## 🚀 How to Load the Extension in Chrome

### Step 1: Build the Extension

```bash
cd /home/runner/work/smart-assistant/smart-assistant
npm install
npm run build
```

The build output will be in the `dist/` directory.

### Step 2: Load in Chrome

1. Open Google Chrome
2. Navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in the top-right corner)
4. Click **"Load unpacked"** button
5. Select the `dist/` folder from this repository
6. The extension should now appear in your extensions list

### Step 3: Configure API Key

1. Click the extension icon in Chrome's toolbar (you may need to pin it first)
2. Enter your Google Gemini API key in the popup
3. Click "Save API Key"
4. You should see a success message

**Getting a Gemini API Key:**
- Go to https://makersuite.google.com/app/apikey
- Sign in with your Google account
- Click "Create API Key"
- Copy the key and paste it in the extension popup

### Step 4: Test the Extension

#### Test on a General Website

1. Open `test-extension-manual.html` in Chrome (from this repository)
2. You should see a floating **"🎓 Ask LearnAI"** button on the right side
3. Try selecting text - the AI tutor interface should appear
4. Press `Ctrl/Cmd + Shift + A` to open the tutor manually

#### Test on LeetCode

1. Go to https://leetcode.com/problems/two-sum/
2. Look for the floating button
3. Select code or problem description text
4. The AI tutor should offer coding-specific help

#### Test on YouTube

1. Go to any educational YouTube video
2. The floating button should appear
3. You can generate video summaries, quizzes, and chat about the content

## 🔍 Verification Checklist

### Installation
- [ ] Extension appears in `chrome://extensions/`
- [ ] No errors shown in the extension card
- [ ] Service worker is "active"
- [ ] Extension icon appears in toolbar

### Configuration
- [ ] Popup opens when clicking extension icon
- [ ] API key can be entered and saved
- [ ] Success message appears after saving
- [ ] API key persists after closing popup

### Functionality
- [ ] Floating button appears on test page
- [ ] Text selection triggers tutor interface
- [ ] Keyboard shortcut (Ctrl/Cmd + Shift + A) works
- [ ] AI responses are generated (requires API key)
- [ ] No errors in browser console (press F12)

### Platform-Specific Features
- [ ] LeetCode: Code analysis and hints
- [ ] YouTube: Video summaries and quizzes
- [ ] General sites: Context-aware help

## 🐛 Troubleshooting

### Extension Won't Load
**Symptom:** Error when loading unpacked extension

**Solutions:**
1. Make sure you selected the `dist/` folder, not the root folder
2. Check that `dist/manifest.json` exists
3. Verify all required files are in `dist/` (run `npm run build` again)
4. Look at the error message in `chrome://extensions/` for specifics

### Floating Button Not Appearing
**Symptom:** No button visible on pages

**Solutions:**
1. Refresh the page after loading the extension
2. Check if the page is in the excluded domains (Google, etc.)
3. Open Developer Tools (F12) and check for errors
4. Verify content scripts are injected (check Elements tab)

### AI Tutor Not Responding
**Symptom:** Interface appears but no AI responses

**Solutions:**
1. Verify API key is configured (click extension icon)
2. Check that the API key is valid (starts with "AIza")
3. Ensure you have Gemini API access enabled
4. Check browser console for API errors
5. Verify internet connection

### Service Worker Errors
**Symptom:** Background service worker shows errors

**Solutions:**
1. Go to `chrome://extensions/`
2. Click "Details" on the LearnAI extension
3. Click "service worker" to see console
4. Check for specific error messages
5. Common issues:
   - API endpoint unreachable (check internet)
   - Invalid API key format
   - Chrome storage errors (clear extension data)

### Content Script Not Injecting
**Symptom:** No extension features on supported sites

**Solutions:**
1. Check that the site matches content script patterns in manifest
2. Look for CSP (Content Security Policy) errors in console
3. Verify the site allows extension scripts
4. Try a different website to rule out site-specific issues

## 📊 Monitoring Extension Health

### Check Service Worker Status
```
1. Go to chrome://extensions/
2. Find LearnAI extension
3. Look for "service worker" link
4. Should show "active"
5. Click to view console logs
```

### Check Content Script Injection
```
1. Open page where extension should work
2. Open Developer Tools (F12)
3. Go to Console tab
4. Look for extension initialization messages
5. Go to Elements tab
6. Search for "learnai" class names in DOM
```

### Check Storage
```
1. Open Developer Tools (F12)
2. Go to Application tab
3. Expand Storage > Chrome Storage
4. Should see extension data including API key
```

## 🔒 Security Notes

- API keys are stored in Chrome's secure sync storage
- Keys are never logged or transmitted except to Gemini API
- All content is sanitized before processing
- Minimal permissions requested
- No external tracking or analytics

## 📝 Manual Testing Script

Use this checklist when testing the extension:

```
[ ] 1. Load extension in Chrome
[ ] 2. Verify no errors in chrome://extensions/
[ ] 3. Configure API key in popup
[ ] 4. Open test-extension-manual.html
[ ] 5. Verify floating button appears
[ ] 6. Select text - tutor should appear
[ ] 7. Test keyboard shortcut (Ctrl/Cmd + Shift + A)
[ ] 8. Ask a question and verify AI response
[ ] 9. Visit leetcode.com - verify button appears
[ ] 10. Visit youtube.com - verify video features work
[ ] 11. Check console for errors (should be none)
[ ] 12. Verify extension icon shows correct badge/state
```

## 🎉 Success Indicators

✅ Extension loaded without errors
✅ API key saved successfully  
✅ Floating button visible on supported sites
✅ Text selection triggers interface
✅ AI generates responses
✅ No errors in console
✅ All features work as documented

## 📞 Support

If you encounter issues:
1. Check this troubleshooting guide
2. Review browser console errors
3. Verify build was successful
4. Check that API key is valid
5. Test on the provided test page first

## 🔄 Rebuilding After Changes

If you make code changes:

```bash
# Rebuild the extension
npm run build

# In chrome://extensions/
# Click the reload icon on the extension card
# Refresh any open tabs to get updated content scripts
```

## 📦 Production Deployment

For production deployment to Chrome Web Store, see `PRODUCTION_DEPLOYMENT.md`.
