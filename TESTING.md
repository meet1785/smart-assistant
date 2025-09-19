# LearnAI Extension Testing Guide

## Quick Start Testing

The LearnAI extension has been successfully built. API key must be configured through the extension popup.

### 1. Load the Extension in Chrome

1. Open Chrome browser
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `/workspaces/smart-assistant` folder (the root folder, not dist)
6. The extension should appear in the extensions list

### 2. Verify Extension Installation

1. Look for the LearnAI icon in the Chrome toolbar
2. Click the extension icon to open the popup
3. You should see "API key is configured ✓" message
4. If not, the API key will be automatically configured from the config file

### 3. Test with the Test Page

1. Open the `test-page.html` file in Chrome:
   - Option A: Drag and drop the file into Chrome
   - Option B: Right-click file → "Open with" → Chrome
   - Option C: Use `file:///workspaces/smart-assistant/test-page.html`

2. The test page will automatically check the extension status
3. Use the test buttons to verify each feature:
   - **Extension Status**: Confirms the extension is loaded
   - **API Key Test**: Verifies the API key is configured
   - **LeetCode Simulation**: Tests coding problem assistance
   - **YouTube Simulation**: Tests video learning features
   - **General Content Test**: Tests webpage content analysis

### 4. Test on Real Websites

#### LeetCode Testing
1. Go to https://leetcode.com/problems/two-sum/
2. Select some code in the editor
3. Look for the LearnAI interface (should appear automatically)
4. Click on different features: "Approach", "Hints", "Test Cases", "Errors"

#### YouTube Testing  
1. Go to any educational YouTube video
2. Play the video for a bit
3. Look for the LearnAI panel
4. Try features like "Generate Quiz", "Summary", "Sections"

#### General Website Testing
1. Visit any educational website (like MDN, W3Schools, etc.)
2. Select some text
3. Right-click and look for LearnAI context menu options
4. Or look for the LearnAI interface panel

### 5. Expected Behaviors

✅ **Success Indicators:**
- Extension loads without errors in chrome://extensions/
- Popup shows "API key is configured ✓"
- Test page shows all green status messages
- Gemini API responses are received (may take 5-10 seconds)
- Content scripts inject properly on supported sites

❌ **Troubleshooting:**
- If extension doesn't load: Check for build errors, ensure all files are present
- If API calls fail: Check network connection, verify API key is valid
- If content scripts don't appear: Check browser console for errors, refresh the page
- If popup doesn't work: Check background script is running

### 6. Manual API Testing

You can also test the API directly using the browser console:

```javascript
// Test API key status
chrome.runtime.sendMessage({action: 'getApiKeyStatus'}, console.log);

// Test a simple tutor request
chrome.runtime.sendMessage({
  action: 'generateTutorResponse',
  data: {
    type: 'general',
    context: {
      title: 'Test',
      url: 'test.com',
      selectedText: 'JavaScript is a programming language',
      pageContent: 'JavaScript is a programming language used for web development'
    },
    userQuery: 'What should I know about JavaScript?'
  }
}, console.log);
```

### 7. Debug Mode

The extension includes debug logging. Check the browser console for detailed logs:
- Background script logs: Go to chrome://extensions/, click "Inspect views: background page"
- Content script logs: Open developer tools on any webpage (F12)
- Popup logs: Right-click extension icon → "Inspect popup"

### 8. Files Overview

- **Built extension**: `/workspaces/smart-assistant/dist/` folder
- **Manifest**: `/workspaces/smart-assistant/manifest.json`
- **Test page**: `/workspaces/smart-assistant/test-page.html`
- **Configuration**: `/workspaces/smart-assistant/src/config/config.ts`

### 9. API Key Information

- **Key**: Configured through extension popup (secure storage)
- **Service**: Google Gemini Pro
- **Status**: Configured automatically in the extension
- **Fallback**: Users can also set it manually via the popup

## Next Steps

1. Load the extension using the instructions above
2. Test with the provided test page
3. Visit LeetCode and YouTube to test real-world functionality
4. Check browser console for any errors or issues
5. Report any problems or unexpected behaviors

The extension is now fully configured and ready for comprehensive testing!