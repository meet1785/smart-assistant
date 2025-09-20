import React from 'react';
import { createRoot } from 'react-dom/client';
import { EnhancedTutorInterface } from '../components/EnhancedTutorInterface';
import { GeneralContext, TutorRequest } from '../types/index';
import '../components/styles.css';

class GeneralContentIntegration {
  private tutorRoot: any = null;
  private isActive = false;
  private selectionTimeout: number | null = null;

  constructor() {
    this.init();
  }

  private init() {
    // Wait for page to load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupGeneralIntegration());
    } else {
      this.setupGeneralIntegration();
    }
  }

  private setupGeneralIntegration() {
    // Only activate on non-YouTube, non-LeetCode pages
    if (this.shouldActivate()) {
      this.addFloatingButton();
      this.setupTextSelectionHandler();
      this.setupKeyboardShortcuts();
      this.setupContextMenuTrigger();
    }
  }

  private shouldActivate(): boolean {
    const hostname = window.location.hostname.toLowerCase();
    
    // Don't activate on these domains (handled by specific content scripts)
    const excludedDomains = [
      'youtube.com',
      'www.youtube.com',
      'leetcode.com',
      'www.leetcode.com',
      'google.com',
      'www.google.com'
    ];

    return !excludedDomains.some(domain => domain === hostname);
  }

  private addFloatingButton() {
    // Don't add if already exists
    if (document.querySelector('.learnai-general-trigger')) return;

    const button = document.createElement('button');
    button.className = 'learnai-general-trigger';
    button.innerHTML = '🎓 LearnAI Help';
    button.onclick = () => this.startTutorSession();
    
    // Style the button
    Object.assign(button.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: '#667eea',
      color: 'white',
      border: 'none',
      borderRadius: '25px',
      padding: '12px 16px',
      fontSize: '14px',
      cursor: 'pointer',
      zIndex: '9999',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    });

    button.addEventListener('mouseenter', () => {
      button.style.background = '#5a67d8';
      button.style.transform = 'translateY(-2px)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.background = '#667eea';
      button.style.transform = 'translateY(0)';
    });
    
    document.body.appendChild(button);
  }

  private setupTextSelectionHandler() {
    let selectionButton: HTMLElement | null = null;

    document.addEventListener('mouseup', (e) => {
      // Remove existing selection button
      if (selectionButton) {
        selectionButton.remove();
        selectionButton = null;
      }

      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 10) {
        const selectedText = selection.toString().trim();
        
        // Don't show for very long selections (likely accidental)
        if (selectedText.length > 2000) return;

        // Create selection helper button
        selectionButton = document.createElement('button');
        selectionButton.className = 'learnai-selection-helper';
        selectionButton.innerHTML = '💡 Explain This';
        selectionButton.onclick = (event) => {
          event.stopPropagation();
          this.handleTextSelection(selectedText);
          if (selectionButton) {
            selectionButton.remove();
            selectionButton = null;
          }
        };

        // Style the selection button
        Object.assign(selectionButton.style, {
          position: 'absolute',
          background: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          padding: '6px 12px',
          fontSize: '12px',
          cursor: 'pointer',
          zIndex: '10000',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          transition: 'all 0.2s'
        });

        // Position the button near the selection
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        selectionButton.style.left = `${rect.left + window.scrollX}px`;
        selectionButton.style.top = `${rect.bottom + window.scrollY + 5}px`;

        document.body.appendChild(selectionButton);

        // Auto-remove after 5 seconds
        setTimeout(() => {
          if (selectionButton) {
            selectionButton.remove();
            selectionButton = null;
          }
        }, 5000);
      }
    });

    // Remove selection button when clicking elsewhere
    document.addEventListener('click', () => {
      if (selectionButton) {
        selectionButton.remove();
        selectionButton = null;
      }
    });
  }

  private setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + Shift + H for general help
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'H') {
        e.preventDefault();
        this.startTutorSession();
      }

      // Ctrl/Cmd + Shift + E to explain selected text
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        const selection = window.getSelection();
        if (selection && selection.toString().trim()) {
          this.handleTextSelection(selection.toString().trim());
        }
      }
    });
  }

  private setupContextMenuTrigger() {
    // Add context menu support for text selection
    document.addEventListener('contextmenu', (e) => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 5) {
        // Store selection for potential use
        (window as any).learnaiSelectedText = selection.toString().trim();
      }
    });
  }

  private extractPageContext(): GeneralContext {
    const title = document.title || 'Unknown Page';
    const url = window.location.href;
    
    // Extract main content from the page
    const pageContent = this.extractMainContent();
    
    return {
      title,
      url,
      pageContent
    };
  }

  private extractMainContent(): string {
    // Try to find main content areas
    const contentSelectors = [
      'main',
      'article',
      '.content',
      '.post',
      '.entry',
      '#content',
      '.main-content',
      '[role="main"]',
      '.post-content',
      '.article-content',
      '.blog-content'
    ];

    let content = '';
    
    for (const selector of contentSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        content = this.extractTextContent(element);
        if (content.length > 200) break;
      }
    }

    // Fallback to body content if no main content found
    if (content.length < 200) {
      content = this.extractTextContent(document.body);
    }

    // Limit content length
    return content.substring(0, 3000);
  }

  private extractTextContent(element: Element): string {
    // Remove script and style elements
    const clone = element.cloneNode(true) as Element;
    const excludeElements = clone.querySelectorAll(
      'script, style, nav, footer, header, .ads, .advertisement, .sidebar, .menu, .navigation'
    );
    excludeElements.forEach(el => el.remove());
    
    return clone.textContent?.trim() || '';
  }

  private handleTextSelection(selectedText: string) {
    const context = this.extractPageContext();
    context.selectedText = selectedText;

    const request: TutorRequest = {
      type: 'general',
      context,
      userQuery: `Please help me understand this selected text: "${selectedText}"`
    };

    this.showTutorInterface(request);
  }

  private startTutorSession() {
    if (this.isActive) {
      this.closeTutor();
      return;
    }

    const context = this.extractPageContext();
    
    // Check if there's selected text
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      context.selectedText = selection.toString().trim();
    }

    const request: TutorRequest = {
      type: 'general',
      context
    };

    this.showTutorInterface(request);
  }

  private showTutorInterface(request: TutorRequest) {
    if (this.isActive) return;

    // Create container for the tutor interface
    const container = document.createElement('div');
    container.id = 'learnai-tutor-container';
    document.body.appendChild(container);

    // Create React root and render the interface
    this.tutorRoot = createRoot(container);
    this.tutorRoot.render(
      <EnhancedTutorInterface 
        request={request} 
        onClose={() => this.closeTutor()} 
      />
    );

    this.isActive = true;

    // Hide floating button when tutor is active
    const floatingBtn = document.querySelector('.learnai-general-trigger') as HTMLElement;
    if (floatingBtn) {
      floatingBtn.style.display = 'none';
    }
  }

  private closeTutor() {
    const container = document.getElementById('learnai-tutor-container');
    if (container) {
      this.tutorRoot?.unmount();
      container.remove();
    }
    this.isActive = false;

    // Show floating button again
    const floatingBtn = document.querySelector('.learnai-general-trigger') as HTMLElement;
    if (floatingBtn) {
      floatingBtn.style.display = 'flex';
    }
  }

  // Detect if page is likely educational content
  private isEducationalContent(): boolean {
    const url = window.location.href.toLowerCase();
    const title = document.title.toLowerCase();
    const content = document.body.textContent?.toLowerCase() || '';

    const educationalKeywords = [
      'tutorial', 'guide', 'how to', 'learn', 'course', 'lesson', 'education',
      'documentation', 'manual', 'instruction', 'example', 'demo', 'walkthrough',
      'blog', 'article', 'post', 'medium.com', 'dev.to', 'stackoverflow.com',
      'github.com', 'docs', 'wiki', 'reference'
    ];

    return educationalKeywords.some(keyword => 
      url.includes(keyword) || title.includes(keyword) || 
      (content.includes(keyword) && content.length > 500)
    );
  }
}

// Only initialize on pages that could benefit from learning assistance
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new GeneralContentIntegration();
  });
} else {
  new GeneralContentIntegration();
}