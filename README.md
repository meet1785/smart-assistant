# LearnAI - Complete Socratic Learning Assistant

🎓 **AI-powered Chrome extension that acts as a comprehensive Socratic tutor for LeetCode problems, YouTube videos, and general learning**

LearnAI uses Google Gemini AI to provide interactive hints and follow-up questions instead of direct answers, helping you learn through guided discovery. Now featuring a complete learning ecosystem with mock interviews, progress tracking, and personalized learning paths.

## ✨ Complete Feature Set

### 🔢 LeetCode Integration
- **Smart Problem Analysis**: Automatically extracts problem details and context
- **Interactive Code Review**: Select code snippets for contextual hints
- **Keyboard Shortcuts**: Press `Ctrl/Cmd + /` in the code editor for instant help
- **Progressive Hints**: Get step-by-step guidance without spoilers
- **Test Case Analysis**: Debug failed test cases with AI assistance
- **Approach Development**: Learn problem-solving methodologies

### 📺 YouTube Integration  
- **Video Context Understanding**: Analyzes video titles and descriptions
- **Text Selection Help**: Select text from comments or descriptions for explanations
- **Video Summarization**: AI-generated summaries of educational content
- **Interactive Quizzes**: Generate quizzes from video content
- **Key Sections**: Identify important video segments
- **Keyboard Shortcuts**: Press `Ctrl/Cmd + Shift + A` for AI assistance

### 🎤 Mock Interview System
- **Complete Interview Simulator**: Practice coding interviews with AI
- **Timer Management**: Timed sessions with countdown
- **Question Generation**: Dynamic coding and behavioral questions
- **Real-time Code Editing**: Integrated code editor for programming challenges
- **AI Interviewer**: Conversational AI that asks follow-up questions
- **Performance Analytics**: Track interview performance and improvement

### 🗺️ Learning Path Management
- **Custom Learning Paths**: Create personalized learning roadmaps
- **Goal Setting & Tracking**: Set learning objectives with milestone tracking
- **Progress Visualization**: Detailed analytics and progress charts
- **Resource Management**: Organize videos, problems, and articles
- **Achievement System**: Unlock achievements as you learn
- **Study Statistics**: Track study time, completed problems, and success rates

### 🤖 Advanced AI Features
- **Socratic Teaching**: Question-based learning that guides discovery
- **Context Awareness**: AI remembers your conversation and learning history
- **Multi-Platform Support**: Seamless experience across LeetCode, YouTube, and general web
- **Voice Integration**: Voice chat capabilities (coming soon)
- **Smart Notes**: AI-powered note-taking with content analysis
- **Code Analysis**: Advanced code review and optimization suggestions

### 📊 Progress & Analytics
- **Experience Points**: Gamified learning with XP and levels
- **Learning Streaks**: Daily learning streak tracking
- **Session Management**: Automatic session tracking and time management
- **Performance Metrics**: Detailed analytics on learning patterns
- **Achievement Badges**: Unlock achievements for learning milestones
- **Weekly Goals**: Set and track weekly learning objectives

## 🚀 Installation & Setup

### Prerequisites
1. **Google Gemini API Key** (free tier available)
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Keep it safe for the extension setup

### Install the Extension

#### Option 1: From Source (Recommended for Full Features)
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

### Setup Your Profile
1. Click the LearnAI extension icon in your browser toolbar
2. Follow the setup instructions to add your Gemini API key
3. The extension will create your learning profile automatically
4. Start learning and track your progress!

## 💡 How to Use

### Enhanced Learning Experience
The new LearnAI provides a comprehensive learning interface with multiple tabs:

#### Chat Tab
- Natural conversation with AI tutor
- Context-aware responses based on current content
- Progressive hints and Socratic questioning
- Smart suggestions for common questions

#### Features Tab
- Platform-specific features (LeetCode problem analysis, YouTube summaries)
- Code debugging and complexity analysis
- Video quiz generation and key section identification
- Smart note-taking and voice interaction

#### Tools Tab
- **Mock Interview**: Launch full interview simulation
- **Learning Paths**: Access your personalized learning roadmaps
- Additional productivity tools for enhanced learning

#### Progress Tab
- Real-time XP and level tracking
- Session statistics and time management
- Achievement notifications and milestone celebrations
- Weekly progress visualization

### On LeetCode
1. **Navigate to any LeetCode problem page**
2. **Multiple ways to get help**:
   - Click the "🎓 Get AI Help" button (appears near problem title)
   - Select code text and the assistant will offer contextual help
   - Press `Ctrl/Cmd + /` while in the code editor
3. **Advanced Features**:
   - Get approach hints without spoilers
   - Analyze failed test cases
   - Learn time/space complexity analysis
   - Practice similar problems

### On YouTube
1. **Watch any educational video**
2. **Multiple ways to get help**:
   - Click the floating "🎓 Ask LearnAI" button
   - Select text from video descriptions or comments
   - Press `Ctrl/Cmd + Shift + A` anywhere on the page
3. **Advanced Features**:
   - Generate video summaries
   - Create interactive quizzes
   - Identify key learning sections
   - Take synchronized notes

### Mock Interviews
1. **Launch from Tools tab** or extension popup
2. **Choose interview type**: Technical, Behavioral, or Full-Stack
3. **Practice with AI interviewer**: Get dynamic questions and real-time feedback
4. **Track performance**: Review detailed analytics and improvement suggestions

### Learning Paths
1. **Create custom paths** for your learning goals
2. **Set milestones** and track progress
3. **Organize resources** from multiple platforms
4. **Monitor statistics** and celebrate achievements

## 🛠️ Technical Architecture

### Modern Tech Stack
- **React 18** + **TypeScript** for type-safe UI components
- **Tailwind CSS v3** for comprehensive design system
- **Zustand** for state management and persistence
- **Google Gemini API** for AI-powered tutoring
- **Chrome Extension Manifest V3** for modern browser compatibility
- **Webpack 5** for optimized bundling and build process

### Component Architecture
```
src/
├── components/
│   ├── ui/              # Reusable UI components (10 components)
│   ├── ai/              # AI-specific components (Chat, Messages)
│   └── layout/          # Layout components (FloatingPanel)
├── features/
│   ├── interview/       # Mock interview system
│   └── learning/        # Learning path management
├── stores/              # Zustand state management
├── content/             # Content scripts for platforms
├── background/          # Service worker for API calls
└── popup/               # Extension popup interface
```

### Performance Metrics
- **Bundle Size**: 740KB (optimized for production)
- **Styles**: 14.6KB comprehensive CSS
- **Type Safety**: 100% TypeScript coverage
- **Build Time**: ~10 seconds for full build
- **Memory Usage**: Optimized for browser extension environment

## 🎯 Design Philosophy

### Socratic Method Implementation
1. **No Direct Answers**: The AI never provides complete solutions
2. **Guided Discovery**: Questions are designed to lead users to insights
3. **Progressive Revelation**: Information is revealed step-by-step
4. **Contextual Understanding**: Responses adapt to user's current knowledge level
5. **Gamified Learning**: XP, levels, and achievements motivate continued learning

### Privacy & Security
- **Local Storage**: API keys stored securely in browser storage
- **No Data Collection**: No personal data sent to external servers beyond Gemini API
- **Minimal Permissions**: Only requests necessary browser permissions
- **Secure Communication**: All API calls use HTTPS with proper authentication

## 🤝 Contributing

We welcome contributions to make LearnAI even better!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Setup
```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Type checking
npm run type-check

# Build for production
npm run build
```

## 📋 Advanced Features Roadmap

### Completed ✅
- [x] **Complete UI Component Library**: Professional React components
- [x] **Mock Interview System**: Full interview simulation with AI
- [x] **Learning Path Management**: Goal setting and progress tracking
- [x] **State Management**: Persistent user data and session tracking  
- [x] **Enhanced Platform Integration**: Advanced LeetCode and YouTube features
- [x] **Progress Analytics**: XP system, achievements, and detailed statistics

### Coming Soon 🚧
- [ ] **Offline Mode**: Basic tutoring without API calls
- [ ] **Voice Integration**: Complete voice-based learning conversations  
- [ ] **Collaborative Learning**: Share progress and compete with friends
- [ ] **Advanced Analytics**: Machine learning insights on learning patterns
- [ ] **Multi-Language Support**: Support for multiple programming languages
- [ ] **Mobile Companion**: Mobile app integration
- [ ] **Additional Platforms**: Stack Overflow, GitHub, Khan Academy support

## 🐛 Troubleshooting

### Common Issues

**Extension not working on LeetCode/YouTube?**
- Make sure you're on the correct domains (leetcode.com, youtube.com)
- Check that the extension is enabled in Chrome extensions page
- Try refreshing the page after installing

**API key errors?**
- Verify your Gemini API key is valid in Google AI Studio
- Check that you have available quota
- Ensure the key has proper permissions

**Build failures?**
```bash
# Clear everything and reinstall
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

**Learning data not saving?**
- Check browser storage permissions
- Ensure you're not in incognito mode
- Try clearing extension data and reconfiguring

## 📈 Usage Statistics

The extension tracks anonymous usage statistics to improve the learning experience:
- Session duration and frequency
- Feature usage patterns (no personal data)
- Error rates for system improvements
- Learning milestone achievements

All data is stored locally and never shared with third parties.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for providing the underlying AI capabilities
- **LeetCode** and **YouTube** for creating platforms that enable learning
- **React Team** for the excellent UI framework
- **Tailwind CSS** for the comprehensive design system
- **Open source community** for the tools and libraries that make this possible

---

**Made with ❤️ for learners everywhere**

*LearnAI - Your complete AI learning companion for mastering coding, interviews, and knowledge acquisition through the power of Socratic questioning.*

## 🆕 Version 2.0 Features

This major update transforms LearnAI from a simple tutoring tool into a comprehensive learning ecosystem:

- **10x More Features**: Complete interview prep, learning paths, and progress tracking
- **Professional UI**: Modern design with 10 custom UI components and dark theme
- **Smart State Management**: Persistent learning data with Zustand
- **Gamified Experience**: XP, levels, achievements, and streak tracking
- **Enhanced AI**: Context-aware conversations with advanced tutoring capabilities
- **Performance Optimized**: Fast, responsive interface with optimized bundle size

Transform your learning journey with the most advanced AI tutoring extension available!
