import React from 'react';
import { createRoot } from 'react-dom/client';
import { EnhancedTutorInterface } from '../components/EnhancedTutorInterface';
import { YouTubeContext, TutorRequest } from '../types/index';
import '../components/styles.css';

class YouTubeIntegration {
  private tutorRoot: any = null;
  private isActive = false;
  private lastVideoId = '';

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
    // Add floating trigger button
    this.addFloatingButton();
    
    // Listen for text selection
    this.setupTextSelectionHandler();
    
    // Listen for video changes (YouTube SPA navigation)
    this.setupVideoChangeHandler();
    
    // Setup keyboard shortcuts
    this.setupKeyboardShortcuts();
  }

  private addFloatingButton() {
    const button = document.createElement('button');
    button.className = 'learnai-youtube-trigger';
    button.innerHTML = '🎓 Ask Leeco AI';
    button.onclick = () => this.startTutorSession();
    
    document.body.appendChild(button);
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