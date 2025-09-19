# LearnAI - Socratic Learning Assistant

🎓 **AI-powered browser extension that acts as a Socratic tutor for LeetCode problems and YouTube videos**

LearnAI uses Google Gemini AI to provide interactive hints and follow-up questions instead of direct answers, helping you learn through guided discovery.

## ✨ Features

### 🔢 LeetCode Integration
- **Smart Problem Analysis**: Automatically extracts problem details and context
- **Interactive Code Review**: Select code snippets for contextual hints
- **Keyboard Shortcuts**: Press `Ctrl/Cmd + /` in the code editor for instant help
- **Progressive Hints**: Get step-by-step guidance without spoilers

### 📺 YouTube Integration  
- **Video Context Understanding**: Analyzes video titles and descriptions
- **Text Selection Help**: Select text from comments or descriptions for explanations
- **Timestamp Awareness**: Considers current video position for context
- **Keyboard Shortcuts**: Press `Ctrl/Cmd + Shift + A` for AI assistance

### 🤖 Socratic Teaching Philosophy
- **No Direct Answers**: Guides you to discover solutions yourself
- **Question-Based Learning**: Uses probing questions to develop understanding
- **Hint System**: Provides just enough guidance to move forward
- **Encouragement**: Celebrates learning milestones and progress

## 🚀 Installation

### Prerequisites
1. **Google Gemini API Key** (free tier available)
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Keep it safe for the extension setup

### Install the Extension

#### Option 1: From Source (Recommended for Development)
1. **Clone the repository**:
   ```bash
   git clone https://github.com/meet1785/smart-assistant.git
   cd smart-assistant
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the extension**:
   ```bash
   npm run build
   ```

4. **Load in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (top right toggle)
   - Click "Load unpacked"
   - Select the entire `smart-assistant` folder
   - The extension should now appear in your extensions list

#### Option 2: Development Mode
```bash
npm run dev  # Watches for changes and rebuilds automatically
```

### Setup API Key
1. Click the LearnAI extension icon in your browser toolbar
2. Follow the setup instructions to add your Gemini API key
3. The extension will save your key securely in browser storage

## 💡 How to Use

### On LeetCode
1. **Navigate to any LeetCode problem page**
2. **Three ways to get help**:
   - Click the "🎓 Get AI Help" button (appears near problem title)
   - Select code text and the assistant will offer contextual help
   - Press `Ctrl/Cmd + /` while in the code editor

### On YouTube
1. **Watch any educational video**
2. **Three ways to get help**:
   - Click the floating "🎓 Ask LearnAI" button
   - Select text from video descriptions or comments
   - Press `Ctrl/Cmd + Shift + A` anywhere on the page

### The Learning Experience
- 🤔 **Ask questions**: Type your confusion or what you're thinking
- 💡 **Receive hints**: Get guided questions that lead to understanding
- 🎯 **Follow suggested steps**: Use the "Next steps to consider" for direction
- 🔄 **Iterate**: Continue the conversation to deepen your understanding

## 🛠️ Development

### Project Structure
```
smart-assistant/
├── manifest.json           # Extension manifest
├── src/
│   ├── background/         # Service worker for API calls
│   ├── content/           # Content scripts for LeetCode & YouTube
│   ├── popup/             # Extension popup for settings
│   ├── components/        # React UI components
│   ├── services/          # Gemini API integration
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── dist/                  # Built extension files
└── icons/                 # Extension icons
```

### Scripts
```bash
npm run build      # Production build
npm run dev        # Development build with watching
npm run type-check # TypeScript type checking
```

### Technologies Used
- **React 18** + **TypeScript** for UI components
- **Webpack 5** for bundling and optimization
- **Google Gemini API** for AI-powered tutoring
- **Chrome Extension Manifest V3** for modern browser compatibility
- **CSS** for responsive styling

## 🎯 Design Principles

### Socratic Method Implementation
1. **No Direct Answers**: The AI never provides complete solutions
2. **Guided Discovery**: Questions are designed to lead users to insights
3. **Progressive Revelation**: Information is revealed step-by-step
4. **Contextual Understanding**: Responses adapt to user's current knowledge level

### Privacy & Security
- **Local Storage**: API keys stored securely in browser storage
- **No Data Collection**: No personal data sent to external servers beyond Gemini API
- **Minimal Permissions**: Only requests necessary browser permissions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📋 Roadmap

- [ ] **Additional Platforms**: Support for Stack Overflow, GitHub, Khan Academy
- [ ] **Offline Mode**: Basic tutoring without API calls
- [ ] **Learning Analytics**: Track learning progress and patterns
- [ ] **Custom Prompts**: User-defined tutoring styles
- [ ] **Voice Integration**: Audio-based learning conversations

## 🐛 Troubleshooting

### Common Issues

**Extension not working on LeetCode/YouTube?**
- Make sure you're on the correct domains (leetcode.com, youtube.com)
- Check that the extension is enabled in Chrome extensions page
- Try refreshing the page after installing

**API key errors?**
- Verify your Gemini API key is valid
- Check that you have available quota in Google AI Studio
- Ensure the key has proper permissions

**Build failures?**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for providing the underlying AI capabilities
- **LeetCode** and **YouTube** for creating platforms that enable learning
- **Open source community** for the tools and libraries that make this possible

---

**Made with ❤️ for learners everywhere**

*LearnAI - Because the best learning happens through questions, not answers.*
