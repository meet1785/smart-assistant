# Leeco AI Clone - Complete Learning Companion

🎓 **Complete Chrome extension clone of Leeco AI - an advanced AI-powered learning companion for coding interview preparation and educational content consumption**

Leeco AI Clone uses Google Gemini AI to provide direct assistance, progressive hints, debugging support, and comprehensive interview preparation. Features a complete learning ecosystem with mock interviews, progress tracking, and personalized learning paths.

## ✨ Complete Feature Set

### 🔢 LeetCode Integration
- **Smart Problem Analysis**: Automatically extracts problem details and provides direct solutions
- **Interactive Code Review**: Select code snippets for immediate debugging assistance
- **Keyboard Shortcuts**: Press `Ctrl/Cmd + /` in the code editor for instant help
- **Progressive Hints**: Get step-by-step guidance with complete explanations
- **Test Case Analysis**: Debug failed test cases with specific solutions
- **Approach Development**: Learn optimal problem-solving methodologies

### 📺 YouTube Integration  
- **Video Context Understanding**: Analyzes video titles and descriptions
- **Text Selection Help**: Select text from comments or descriptions for detailed explanations
- **Video Summarization**: AI-generated comprehensive summaries of educational content
- **Interactive Quizzes**: Generate and solve quizzes from video content
- **Key Sections**: Identify and explain important video segments
- **Keyboard Shortcuts**: Press `Ctrl/Cmd + Shift + A` for AI assistance

### 🎤 Mock Interview System
- **Complete Interview Simulator**: Practice coding interviews with advanced AI interviewer
- **Timer Management**: Timed sessions with countdown and performance tracking
- **Question Generation**: Dynamic coding, behavioral, and system design questions
- **Real-time Code Editing**: Integrated code editor with syntax highlighting
- **AI Interviewer**: Conversational AI that provides detailed feedback
- **Performance Analytics**: Track interview performance and get improvement suggestions

### 🗺️ Learning Path Management
- **Custom Learning Paths**: Create personalized learning roadmaps with AI recommendations
- **Goal Setting & Tracking**: Set learning objectives with milestone tracking and rewards
- **Progress Visualization**: Detailed analytics and progress charts with insights
- **Resource Management**: Organize videos, problems, and articles efficiently
- **Achievement System**: Unlock achievements and badges as you learn
- **Study Statistics**: Track study time, completed problems, and success rates

### 🤖 Advanced AI Features
- **Direct Assistance**: Get immediate answers and solutions when needed
- **Context Awareness**: AI remembers your conversation and learning history
- **Multi-Platform Support**: Seamless experience across LeetCode, YouTube, and general web
- **Voice Integration**: Voice chat capabilities for hands-free learning
- **Smart Notes**: AI-powered note-taking with content analysis and enhancement
- **Code Analysis**: Advanced code review, optimization, and security suggestions

### 📊 Progress & Analytics
- **Experience Points**: Gamified learning with XP, levels, and achievements
- **Learning Streaks**: Daily learning streak tracking with motivation
- **Session Management**: Automatic session tracking and time management
- **Performance Metrics**: Detailed analytics on learning patterns and improvement
- **Achievement Badges**: Unlock achievements for learning milestones
- **Weekly Goals**: Set and track weekly learning objectives with AI insights

### 💾 Data Management
- **Backup & Restore**: Export and import all your learning data
- **Data Portability**: Transfer your progress between devices
- **Two Import Modes**: Merge with existing data or replace completely
- **Secure Exports**: Optional API key inclusion with clear warnings
- **Version Control**: Automatic version compatibility checking

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
1. Click the Leeco AI Clone extension icon in your browser toolbar
2. Follow the setup instructions to add your Gemini API key
3. The extension will create your learning profile automatically
4. Start learning with direct AI assistance and track your progress!

## 💡 How to Use

### Enhanced Learning Experience
The new Leeco AI Clone provides a comprehensive learning interface with multiple tabs:

#### Chat Tab
- Natural conversation with AI learning companion
- Context-aware responses with direct answers and solutions
- Progressive hints and comprehensive explanations
- Smart suggestions for optimized learning paths

#### Features Tab
- Platform-specific features (LeetCode solution analysis, YouTube comprehensive summaries)
- Code debugging and complexity analysis with optimization suggestions
- Video quiz generation and detailed key section explanations
- Smart note-taking and voice interaction capabilities

#### Tools Tab
- **Mock Interview**: Launch comprehensive interview simulation with real-time feedback
- **Learning Paths**: Access your personalized learning roadmaps with AI recommendations
- **Flashcards**: Review using spaced repetition system for better retention
- **Backup & Restore**: Export and import your learning data for safekeeping
- Additional productivity tools for enhanced learning and skill development

#### Progress Tab
- Real-time XP and level tracking with detailed analytics
- Session statistics and time management insights
- Achievement notifications and milestone celebrations with rewards
- Weekly progress visualization and performance optimization suggestions

### On LeetCode
1. **Navigate to any LeetCode problem page**
2. **Multiple ways to get help**:
   - Click the "🎓 Get AI Help" button (appears near problem title)
   - Select code text and the assistant will offer immediate solutions and debugging
   - Press `Ctrl/Cmd + /` while in the code editor
3. **Advanced Features**:
   - Get complete approach explanations with code examples
   - Analyze failed test cases with specific fixes
   - Learn time/space complexity analysis with optimization tips
   - Practice similar problems with AI-generated variations

### On YouTube
1. **Watch any educational video**
2. **Multiple ways to get help**:
   - Click the floating "🎓 Ask Leeco AI" button
   - Select text from video descriptions or comments
   - Press `Ctrl/Cmd + Shift + A` anywhere on the page
3. **Advanced Features**:
   - Generate comprehensive video summaries with key insights
   - Create interactive quizzes with detailed explanations
   - Identify key learning sections with timestamps
   - Take synchronized notes with AI enhancement

### Mock Interviews
1. **Launch from Tools tab** or extension popup
2. **Choose interview type**: Technical, Behavioral, System Design, or Full-Stack
3. **Practice with AI interviewer**: Get dynamic questions and comprehensive real-time feedback
4. **Track performance**: Review detailed analytics and personalized improvement suggestions

### Learning Paths
1. **Create custom paths** for your specific learning goals with AI recommendations
2. **Set milestones** and track progress with detailed analytics
3. **Organize resources** from multiple platforms with smart categorization
4. **Monitor statistics** and celebrate achievements with rewards system

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

### Direct AI Assistance Implementation
1. **Immediate Solutions**: The AI provides complete solutions and explanations when requested
2. **Progressive Learning**: Information builds from basic concepts to advanced implementations
3. **Contextual Understanding**: Responses adapt to user's current knowledge level and goals
4. **Comprehensive Support**: Full assistance for coding interviews, debugging, and learning
5. **Gamified Learning**: XP, levels, and achievements motivate continued learning and skill development

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
- [x] **Data Export/Import**: Backup and restore all learning data with version control

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
- Try refreshing the page after installing the Leeco AI Clone

**API key errors?**
- Verify your Gemini API key is valid in Google AI Studio
- Check that you have available quota for advanced AI features
- Ensure the key has proper permissions for Leeco AI functionality

**Build failures?**
```bash
# Clear everything and reinstall for Leeco AI Clone
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

**Learning data not saving?**
- Check browser storage permissions for Leeco AI Clone
- Ensure you're not in incognito mode
- Try clearing extension data and reconfiguring your profile

## 📈 Usage Statistics

The extension tracks anonymous usage statistics to improve the learning experience and AI assistance:
- Session duration and frequency for optimization
- Feature usage patterns (no personal data) for enhancement
- Error rates for system improvements and reliability
- Learning milestone achievements for motivation features

All data is stored locally and never shared with third parties.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for providing the advanced AI capabilities for learning assistance
- **LeetCode** and **YouTube** for creating platforms that enable comprehensive learning
- **React Team** for the excellent UI framework powering the interface
- **Tailwind CSS** for the comprehensive design system and modern styling
- **Open source community** for the tools and libraries that make this Leeco AI clone possible

---

**Made with ❤️ for learners everywhere**

*Leeco AI Clone - Your complete AI learning companion for mastering coding, interviews, and knowledge acquisition through advanced AI assistance and comprehensive learning features.*

## 🆕 Version 2.0 Features

This major update transforms the extension from a simple tutoring tool into a complete Leeco AI clone with comprehensive learning ecosystem:

- **10x More Features**: Complete interview prep, learning paths, direct AI assistance, and progress tracking
- **Professional UI**: Modern design with 10+ custom UI components and advanced dark theme
- **Smart State Management**: Persistent learning data with Zustand and comprehensive analytics
- **Gamified Experience**: XP, levels, achievements, and streak tracking with rewards
- **Enhanced AI**: Context-aware conversations with advanced tutoring capabilities and direct solutions
- **Performance Optimized**: Fast, responsive interface with optimized bundle size and smooth animations

Transform your learning journey with the most advanced AI learning companion extension available - a complete Leeco AI clone!
