# LearnAI Extension - Development Guide

## 🏗️ Architecture Overview

### Extension Structure
```
LearnAI Extension (Manifest V3)
├── Background Service Worker
│   ├── Gemini API Integration
│   ├── Session Management  
│   └── Message Routing
├── Content Scripts
│   ├── LeetCode Integration
│   │   ├── Problem Detection
│   │   ├── Code Analysis
│   │   └── UI Injection
│   └── YouTube Integration
│       ├── Video Context
│       ├── Text Selection
│       └── Transcript Analysis
└── Popup Interface
    ├── API Key Management
    ├── Settings Configuration
    └── Usage Instructions
```

### Technical Stack
- **Frontend**: React 18 + TypeScript
- **Build System**: Webpack 5 + ts-loader
- **AI Service**: Google Gemini Pro API
- **Styling**: CSS with CSS Modules pattern
- **Extension API**: Chrome Extension Manifest V3

## 🔧 Development Workflow

### Setup
```bash
git clone <repository>
cd smart-assistant
npm install
```

### Development Commands
```bash
npm run dev        # Watch mode for development
npm run build      # Production build
npm run type-check # TypeScript validation
```

### Testing the Extension
1. Build the extension: `npm run build`
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the project root directory
5. The extension will be loaded with hot-reload support in dev mode

## 🎯 Core Features Implementation

### Socratic Tutoring Logic
The extension implements the Socratic method through:

1. **Question-First Approach**: Never provides direct answers
2. **Progressive Revelation**: Information unveiled step-by-step
3. **Contextual Understanding**: Adapts to user's knowledge level
4. **Guided Discovery**: Questions lead to user insights

### LeetCode Integration
- **Problem Parsing**: Extracts title, difficulty, description
- **Code Context**: Analyzes selected code snippets
- **UI Integration**: Non-intrusive button placement
- **Keyboard Shortcuts**: `Ctrl/Cmd + /` for quick access

### YouTube Integration  
- **Video Analysis**: Title, description, timestamp context
- **Text Selection**: Contextual help for selected content
- **Transcript Integration**: Uses available video transcripts
- **Floating UI**: Non-blocking interface design

## 🚀 Deployment

### Building for Production
```bash
npm run build
```
This creates optimized bundles in the `dist/` directory.

### Extension Packaging
The built extension can be:
1. **Loaded unpacked** for development
2. **Packaged as .crx** for distribution
3. **Published to Chrome Web Store**

### Environment Variables
The extension stores the Gemini API key securely using:
- `chrome.storage.sync` for cross-device synchronization
- Local encryption for sensitive data
- No external storage or analytics

## 🔐 Security Considerations

### API Key Management
- Keys stored in browser's secure storage
- No transmission except to Google Gemini API
- User-controlled key management through popup

### Content Security Policy
- Strict CSP headers in manifest
- No inline scripts or eval()
- Trusted external domains only

### Permissions
Minimal required permissions:
- `activeTab`: For current page interaction
- `storage`: For API key persistence
- Host permissions for LeetCode and YouTube only

## 🎨 UI/UX Design Principles

### Non-Intrusive Design
- Minimal visual footprint
- Contextual activation
- Easy dismissal/closing
- Consistent with platform aesthetics

### Accessibility
- Keyboard navigation support
- Screen reader compatibility
- High contrast color scheme
- Focus management

### Responsive Design
- Works across different screen sizes
- Adapts to page layouts
- Mobile-friendly interactions

## 🧪 Testing Strategy

### Manual Testing Checklist
- [ ] Extension loads without errors
- [ ] Popup renders and accepts API key
- [ ] LeetCode integration activates on problem pages
- [ ] YouTube integration works on video pages
- [ ] Gemini API responses are properly formatted
- [ ] Error handling works for API failures
- [ ] Keyboard shortcuts function correctly

### Automated Testing (Future)
- Unit tests for utility functions
- Integration tests for API calls
- E2E tests for user workflows
- Performance testing for large pages

## 🐛 Common Development Issues

### Build Errors
- **TypeScript errors**: Check type definitions in `src/types/`
- **Import issues**: Verify file paths and extensions
- **Webpack failures**: Check `webpack.config.js` configuration

### Runtime Errors
- **API key issues**: Verify Gemini API key validity
- **Content script injection**: Check manifest permissions
- **Cross-origin requests**: Ensure proper CORS handling

### Extension Loading
- **Manifest errors**: Validate manifest.json syntax
- **Permission issues**: Check required permissions
- **Service worker problems**: Check background script logs

## 📊 Performance Considerations

### Bundle Size Optimization
- Tree shaking for unused code
- Code splitting for different contexts
- Minification for production builds

### Runtime Performance
- Lazy loading of components
- Efficient DOM queries
- Debounced user interactions
- Memory leak prevention

### API Usage
- Request rate limiting
- Response caching
- Error retry logic
- Fallback handling

## 🔄 Future Enhancements

### Platform Extensions
- Stack Overflow integration
- Khan Academy support
- GitHub code review assistance
- Documentation sites integration

### Advanced Features
- Learning progress tracking
- Personalized tutoring styles
- Voice interaction support
- Offline basic tutoring

### Technical Improvements
- WebAssembly for performance
- Advanced caching strategies
- Improved error reporting
- Analytics integration (privacy-preserving)

## 📝 Contributing Guidelines

### Code Style
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Consistent naming conventions

### Pull Request Process
1. Create feature branch
2. Implement changes with tests
3. Update documentation
4. Submit PR with clear description
5. Address review feedback

### Issue Reporting
- Use issue templates
- Provide reproduction steps
- Include browser/extension versions
- Add relevant logs/screenshots

---

**Happy coding! 🚀**