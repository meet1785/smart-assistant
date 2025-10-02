import React from 'react';
import { createRoot } from 'react-dom/client';
import { EnhancedTutorInterface } from '../components/EnhancedTutorInterface';
import { YouTubeContext, TutorRequest } from '../types/index';
import '../components/styles.css';

class YouTubeIntegration {
  private tutorRoot: any = null;
  private isActive = false;
  private lastVideoId = '';
  private videoData: YouTubeContext | null = null;
  private transcriptCache: string | null = null;

  constructor() {
    this.init();
  }

  private init() {
    // Wait for page to load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupYouTubeIntegration());
    } else {
      this.setupYouTubeIntegration();
    }
  }

  private setupYouTubeIntegration() {
    // Add enhanced floating button with quick actions
    this.addEnhancedFloatingButton();
    
    // Listen for text selection
    this.setupTextSelectionHandler();
    
    // Listen for video changes (YouTube SPA navigation)
    this.setupVideoChangeHandler();
    
    // Setup keyboard shortcuts
    this.setupKeyboardShortcuts();
    
    // Enhanced video analysis
    this.setupVideoAnalysis();
    
    // Transcript extraction
    this.extractTranscriptData();
  }

  private addEnhancedFloatingButton() {
    // Remove existing button if present
    const existingButton = document.querySelector('.learnai-youtube-trigger');
    if (existingButton) {
      existingButton.remove();
    }
    
    // Create enhanced button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'leeco-ai-youtube-container';
    buttonContainer.style.cssText = `
      position: fixed;
      top: 50%;
      right: 20px;
      transform: translateY(-50%);
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 8px;
      transition: all 0.3s ease;
    `;

    // Main button
    const mainButton = document.createElement('button');
    mainButton.className = 'learnai-youtube-trigger';
    mainButton.innerHTML = '🎓 Ask Leeco AI';
    mainButton.onclick = () => this.startTutorSession();

    // Quick action buttons
    const summaryButton = document.createElement('button');
    summaryButton.innerHTML = '📝 Summary';
    summaryButton.onclick = () => this.getVideoSummary();
    
    const quizButton = document.createElement('button');
    quizButton.innerHTML = '❓ Quiz';
    quizButton.onclick = () => this.generateQuiz();
    
    const sectionsButton = document.createElement('button');
    sectionsButton.innerHTML = '📑 Sections';
    sectionsButton.onclick = () => this.getVideoSections();

    // Style all buttons
    [mainButton, summaryButton, quizButton, sectionsButton].forEach((btn, index) => {
      btn.style.cssText = `
        background: ${index === 0 ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#ff4757'};
        color: white;
        border: none;
        padding: ${index === 0 ? '12px 16px' : '10px 12px'};
        border-radius: 8px;
        font-size: ${index === 0 ? '14px' : '12px'};
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        min-width: ${index === 0 ? '140px' : '100px'};
        text-align: center;
      `;
      
      btn.addEventListener('mouseover', () => {
        btn.style.transform = 'translateX(-4px)';
        btn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
      });
      
      btn.addEventListener('mouseout', () => {
        btn.style.transform = 'translateX(0)';
        btn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
      });
    });

    buttonContainer.appendChild(mainButton);
    buttonContainer.appendChild(summaryButton);
    buttonContainer.appendChild(quizButton);
    buttonContainer.appendChild(sectionsButton);
    
    document.body.appendChild(buttonContainer);
  }

  private setupTextSelectionHandler() {
    document.addEventListener('mouseup', (e) => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 10) {
        // Check if selection is from video description, comments, or transcript
        const selectedElement = selection.anchorNode?.parentElement || null;
        if (this.isRelevantElement(selectedElement)) {
          this.showSelectionHelp();
        }
      }
    });
  }

  private isRelevantElement(element: Element | null): boolean {
    if (!element) return false;
    
    // Check if selection is from description, comments, or transcript areas
    const relevantSelectors = [
      '#description',
      '.ytd-video-secondary-info-renderer',
      '.ytd-comment-renderer',
      '.ytd-transcript-renderer',
      '#meta-contents'
    ];
    
    return relevantSelectors.some(selector => 
      element.closest(selector) !== null
    );
  }

  private setupVideoChangeHandler() {
    // Monitor URL changes for SPA navigation
    let currentUrl = location.href;
    
    const observer = new MutationObserver(() => {
      if (location.href !== currentUrl) {
        currentUrl = location.href;
        this.onVideoChange();
      }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Also listen for history changes
    window.addEventListener('popstate', () => this.onVideoChange());
  }

  private onVideoChange() {
    const videoId = this.extractVideoId();
    if (videoId && videoId !== this.lastVideoId) {
      this.lastVideoId = videoId;
      // Close any active tutor session when video changes
      if (this.isActive) {
        this.closeTutor();
      }
    }
  }

  private setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + Shift + A to open tutor
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        this.startTutorSession();
      }
    });
  }

  private showSelectionHelp() {
    const selection = window.getSelection();
    if (!selection) return;

    const selectedText = selection.toString().trim();
    const context = this.extractVideoContext();
    
    if (context) {
      context.selectedText = selectedText;
      this.startTutorSession(context);
    }
  }

  private extractVideoId(): string {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('v') || '';
  }

  private extractVideoContext(): YouTubeContext | null {
    try {
      // Extract video title
      const titleElement = document.querySelector('h1.ytd-video-primary-info-renderer') ||
                          document.querySelector('#title h1') ||
                          document.querySelector('.title');
      const title = titleElement?.textContent?.trim() || 'Unknown Video';

      // Get current timestamp if video is playing
      const video = document.querySelector('video');
      const timestamp = video ? Math.floor(video.currentTime) : undefined;

      // Try to extract transcript if available
      const transcript = this.extractTranscript();

      return {
        title,
        timestamp,
        transcript
      };
    } catch (error) {
      console.error('Error extracting video context:', error);
      return null;
    }
  }

  private extractTranscript(): string | undefined {
    try {
      // Look for transcript elements
      const transcriptElements = document.querySelectorAll('.ytd-transcript-segment-renderer');
      if (transcriptElements.length > 0) {
        return Array.from(transcriptElements)
          .map(el => el.textContent?.trim())
          .filter(text => text)
          .join(' ')
          .slice(0, 2000); // Limit transcript length
      }

      // Fallback: try to get description
      const description = document.querySelector('#description')?.textContent?.trim();
      return description?.slice(0, 1000);
    } catch (error) {
      console.error('Error extracting transcript:', error);
      return undefined;
    }
  }

  private startTutorSession(contextOverride?: YouTubeContext) {
    if (this.isActive) {
      this.closeTutor();
      return;
    }

    const context = contextOverride || this.extractVideoContext();
    if (!context) {
      alert('Could not extract video information. Please make sure you are on a YouTube video page.');
      return;
    }

    const request: TutorRequest = {
      type: 'youtube',
      context
    };

    this.showTutorInterface(request);
  }

  private showTutorInterface(request: TutorRequest) {
    // Create container for the tutor interface
    const container = document.createElement('div');
    container.id = 'learnai-tutor-container';
    document.body.appendChild(container);

    // Create React root and render
    this.tutorRoot = createRoot(container);
    this.tutorRoot.render(
      <EnhancedTutorInterface 
        request={request} 
        onClose={() => this.closeTutor()} 
      />
    );

    this.isActive = true;
  }

  // Enhanced YouTube Methods for Leeco AI Clone functionality
  private async getVideoSummary() {
    const context = this.videoData || this.extractVideoContext();
    if (!context) {
      alert('Could not extract video information for summary.');
      return;
    }

    // Add transcript if available
    if (this.transcriptCache) {
      context.transcript = this.transcriptCache;
    }

    const request: TutorRequest = {
      type: 'youtube',
      context,
      requestedFeature: 'summary',
      userQuery: 'Please provide a comprehensive summary of this video with key insights and takeaways'
    };

    this.showTutorInterface(request);
  }

  private async generateQuiz() {
    const context = this.videoData || this.extractVideoContext();
    if (!context) {
      alert('Could not extract video information for quiz generation.');
      return;
    }

    // Add transcript if available
    if (this.transcriptCache) {
      context.transcript = this.transcriptCache;
    }

    const request: TutorRequest = {
      type: 'youtube',
      context,
      requestedFeature: 'quiz',
      userQuery: 'Please create an interactive quiz based on this video content with multiple choice and open-ended questions'
    };

    this.showTutorInterface(request);
  }

  private async getVideoSections() {
    const context = this.videoData || this.extractVideoContext();
    if (!context) {
      alert('Could not extract video information for section analysis.');
      return;
    }

    // Add transcript if available
    if (this.transcriptCache) {
      context.transcript = this.transcriptCache;
    }

    const request: TutorRequest = {
      type: 'youtube',
      context,
      requestedFeature: 'sections',
      userQuery: 'Please analyze this video and identify key sections with timestamps and topics covered'
    };

    this.showTutorInterface(request);
  }

  private setupVideoAnalysis() {
    // Monitor for video changes and extract data
    const observer = new MutationObserver(() => {
      const currentVideoId = this.getCurrentVideoId();
      if (currentVideoId && currentVideoId !== this.lastVideoId) {
        this.lastVideoId = currentVideoId;
        this.videoData = this.extractVideoContext();
        this.transcriptCache = null; // Reset transcript cache
        this.extractTranscriptData(); // Re-extract for new video
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  private getCurrentVideoId(): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('v');
  }

  private async extractTranscriptData() {
    try {
      // Wait for video to load
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Try to find transcript or captions
      const transcriptButton = document.querySelector('[aria-label*="transcript"]') ||
                              document.querySelector('[aria-label*="Transcript"]') ||
                              document.querySelector('button[aria-label*="Show transcript"]');
      
      if (transcriptButton) {
        // Click to open transcript
        (transcriptButton as HTMLElement).click();
        
        // Wait for transcript to load
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Extract transcript text
        const transcriptElements = document.querySelectorAll('ytd-transcript-segment-renderer .segment-text');
        if (transcriptElements.length > 0) {
          const transcriptText = Array.from(transcriptElements)
            .map(el => el.textContent?.trim())
            .filter(text => text)
            .join(' ');
          
          this.transcriptCache = transcriptText.slice(0, 3000); // Limit size
        }
      }
    } catch (error) {
      // Transcript extraction failed - not critical, continue without it
    }
  }

  private closeTutor() {
    const container = document.getElementById('learnai-tutor-container');
    if (container) {
      this.tutorRoot?.unmount();
      container.remove();
    }
    this.isActive = false;
  }
}

// Initialize the YouTube integration
new YouTubeIntegration();