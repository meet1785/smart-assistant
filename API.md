# LearnAI API Documentation

This document provides comprehensive documentation for the LearnAI Chrome extension's internal APIs and interfaces.

## Table of Contents
1. [UI Components API](#ui-components-api)
2. [AI Components API](#ai-components-api)
3. [State Management API](#state-management-api)
4. [Feature Components API](#feature-components-api)
5. [Background Services API](#background-services-api)
6. [Types & Interfaces](#types--interfaces)

## UI Components API

### Button
Versatile button component with multiple variants and states.

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}
```

**Usage:**
```tsx
<Button 
  variant="primary" 
  size="md" 
  loading={isSubmitting}
  onClick={handleSubmit}
>
  Submit
</Button>
```

### Input
Form input component with validation and icon support.

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outline';
}
```

**Usage:**
```tsx
<Input
  label="Email"
  type="email"
  error={errors.email}
  icon={<EmailIcon />}
  onChange={handleChange}
/>
```

### Card
Container component with header, content, and footer sections.

```typescript
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'sm' | 'md' | 'lg' | 'none';
}
```

**Usage:**
```tsx
<Card variant="elevated" padding="md">
  <CardHeader title="Learning Progress" />
  <CardContent>
    <p>Your current progress...</p>
  </CardContent>
  <CardFooter>
    <Button>Continue Learning</Button>
  </CardFooter>
</Card>
```

### Modal
Full-screen modal with customizable size and behavior.

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
}
```

### Progress
Linear and circular progress indicators.

```typescript
interface ProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  label?: string;
}

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
}
```

### Additional UI Components
- **Badge**: Status indicators with color variants
- **Avatar**: User avatars with fallback initials
- **Tabs**: Horizontal and vertical tab navigation
- **Alert**: Notification messages with icons
- **Skeleton**: Loading placeholders

## AI Components API

### ChatInterface
Main chat interface for AI conversations.

```typescript
interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  showSuggestions?: boolean;
  suggestions?: string[];
  className?: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: number;
  metadata?: {
    responseType?: GeminiResponse['type'];
    nextSteps?: string[];
    context?: string;
  };
}
```

**Usage:**
```tsx
<ChatInterface
  messages={chatMessages}
  onSendMessage={handleMessage}
  isLoading={isProcessing}
  suggestions={['I need a hint', 'Explain this concept']}
/>
```

### MessageBubble
Individual message display component.

```typescript
interface MessageBubbleProps {
  message: ChatMessage;
  showTimestamp?: boolean;
  className?: string;
}
```

### TypingIndicator
Animated typing indicator for AI responses.

```typescript
interface TypingIndicatorProps {
  className?: string;
  text?: string;
}
```

## State Management API

### UserStore
Manages user profile, preferences, and authentication.

```typescript
interface UserState {
  profile: UserProfile | null;
  isAuthenticated: boolean;
  apiKey: string | null;
  
  // Actions
  setProfile: (profile: UserProfile) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  setApiKey: (apiKey: string) => void;
  clearUser: () => void;
  incrementExperience: (amount: number) => void;
  updateStreak: () => void;
}
```

**Usage:**
```tsx
const { profile, incrementExperience, updatePreferences } = useUserStore();

// Award experience points
incrementExperience(10);

// Update user preferences
updatePreferences({ theme: 'dark' });
```

### LearningStore
Manages learning sessions, goals, and progress.

```typescript
interface LearningState {
  currentSession: LearningSession | null;
  recentSessions: LearningSession[];
  goals: LearningGoal[];
  paths: LearningPath[];
  stats: StudyStats;
  
  // Actions
  startSession: (type: LearningSession['type'], platform: string) => void;
  endSession: (notes?: string) => void;
  addGoal: (goal: LearningGoal) => void;
  updateGoal: (goalId: string, updates: Partial<LearningGoal>) => void;
  addProblemSolved: (difficulty: 'easy' | 'medium' | 'hard') => void;
}
```

**Usage:**
```tsx
const { startSession, endSession, addProblemSolved } = useLearningStore();

// Start a learning session
startSession('leetcode', 'LeetCode Problem');

// Record problem completion
addProblemSolved('medium');

// End session with notes
endSession('Completed array problems');
```

## Feature Components API

### InterviewSimulator
Complete mock interview system.

```typescript
interface InterviewSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  sessionType?: 'technical' | 'behavioral' | 'full-stack';
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface InterviewQuestion {
  id: string;
  type: 'coding' | 'behavioral' | 'system-design' | 'technical';
  difficulty: 'easy' | 'medium' | 'hard';
  title: string;
  description: string;
  hints?: string[];
  timeLimit?: number;
  testCases?: Array<{
    input: any;
    expected: any;
    description?: string;
  }>;
}
```

**Usage:**
```tsx
<InterviewSimulator
  isOpen={showInterview}
  onClose={() => setShowInterview(false)}
  sessionType="technical"
  difficulty="medium"
/>
```

### LearningPathManager
Learning path and goal management interface.

```typescript
interface LearningPathManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LearningGoal {
  id: string;
  title: string;
  description: string;
  category: 'coding' | 'algorithms' | 'system-design' | 'interview-prep' | 'general';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours: number;
  completedHours: number;
  isCompleted: boolean;
  milestones: LearningMilestone[];
  resources: LearningResource[];
}
```

### FloatingPanel
Draggable and resizable panel container.

```typescript
interface FloatingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  draggable?: boolean;
  resizable?: boolean;
  defaultPosition?: { x: number; y: number };
  defaultSize?: { width: number; height: number };
  minSize?: { width: number; height: number };
  maxSize?: { width: number; height: number };
}
```

## Background Services API

### Chrome Runtime Messages
Communication between content scripts, popup, and background service.

```typescript
// Message types
interface MessageRequest {
  action: string;
  data?: any;
}

// Common actions
type MessageAction = 
  | 'generateTutorResponse'
  | 'startTutorSession'
  | 'setApiKey'
  | 'getApiKeyStatus'
  | 'generateVideoSummary'
  | 'generateVideoQuiz'
  | 'saveProblemSolution'
  | 'getProgress'
  | 'getAchievements';
```

**Usage:**
```tsx
// Send message to background script
const response = await chrome.runtime.sendMessage({
  action: 'generateTutorResponse',
  data: tutorRequest
});

// Handle response
if (response.type === 'error') {
  setError(response.content);
} else {
  setAIResponse(response);
}
```

### Gemini Service
AI service for generating responses.

```typescript
interface GeminiService {
  generateResponse(request: TutorRequest): Promise<GeminiResponse>;
  buildSocraticPrompt(request: TutorRequest): string;
  validateApiKey(apiKey: string): Promise<boolean>;
}
```

## Types & Interfaces

### Core Types

```typescript
// Tutor request and response types
interface TutorRequest {
  type: 'leetcode' | 'youtube' | 'general';
  context: LeetCodeProblem | YouTubeContext | GeneralContext;
  userQuery?: string;
  previousInteraction?: string;
  requestedFeature?: 'quiz' | 'summary' | 'sections' | 'hints' | 'approach';
}

interface GeminiResponse {
  type: 'question' | 'hint' | 'followup' | 'encouragement' | 'error';
  content: string;
  context?: string;
  nextSteps?: string[];
}

// Platform-specific contexts
interface LeetCodeProblem {
  title: string;
  difficulty: string;
  description: string;
  selectedCode?: string;
  language?: string;
}

interface YouTubeContext {
  title: string;
  selectedText?: string;
  timestamp?: number;
  transcript?: string;
}

interface GeneralContext {
  title: string;
  url: string;
  selectedText?: string;
  pageContent?: string;
}
```

### Learning Types

```typescript
interface LearningSession {
  id: string;
  type: 'leetcode' | 'youtube' | 'interview' | 'general';
  platform: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  topics: string[];
  problems?: {
    attempted: number;
    solved: number;
    difficulty: Record<string, number>;
  };
  notes: string;
  achievements: string[];
}

interface StudyStats {
  totalHours: number;
  sessionsCount: number;
  problemsSolved: number;
  averageSessionLength: number;
  favoriteTopics: string[];
  weeklyGoal: number;
  weeklyProgress: number;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  tutorStyle: 'socratic' | 'direct' | 'encouraging';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  platforms: {
    leetcode: boolean;
    youtube: boolean;
    general: boolean;
  };
  notifications: {
    achievements: boolean;
    reminders: boolean;
    progress: boolean;
  };
}
```

## Error Handling

### Error Types
```typescript
interface APIError {
  type: 'api_error' | 'validation_error' | 'network_error' | 'auth_error';
  message: string;
  details?: any;
}
```

### Error Handling Patterns
```tsx
try {
  const response = await chrome.runtime.sendMessage(request);
  if (response.type === 'error') {
    throw new Error(response.content);
  }
  // Handle success
} catch (error) {
  setError(error.message);
  console.error('API Error:', error);
}
```

## Development Guidelines

### Component Development
1. Use TypeScript interfaces for all props
2. Implement error boundaries for robustness
3. Follow React best practices (hooks, functional components)
4. Use Tailwind CSS for styling
5. Include accessibility attributes (ARIA labels, keyboard navigation)

### State Management
1. Use Zustand stores for global state
2. Keep local state minimal
3. Persist important data to browser storage
4. Handle async operations properly

### Performance Optimization
1. Use React.memo for expensive components
2. Implement lazy loading where appropriate
3. Optimize bundle size with tree shaking
4. Use proper cleanup in useEffect hooks

### Testing Guidelines
1. Write unit tests for utility functions
2. Test component rendering and interactions
3. Mock external dependencies (Chrome APIs, network calls)
4. Test error scenarios and edge cases

This API documentation provides a comprehensive reference for developing with and extending the LearnAI Chrome extension. For specific implementation examples, refer to the source code in the respective component files.