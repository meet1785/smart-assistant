import { GeminiService } from './gemini';
import { GeneralContext, GeminiResponse } from '../types/index';

export class ContextAwarenessService {
  private geminiService: GeminiService | null = null;

  constructor(geminiService: GeminiService | null) {
    this.geminiService = geminiService;
  }

  extractPageContext(): GeneralContext {
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
      '[role="main"]'
    ];

    let content = '';
    
    for (const selector of contentSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        content = this.extractTextContent(element);
        if (content.length > 100) break;
      }
    }

    // Fallback to body content if no main content found
    if (content.length < 100) {
      content = this.extractTextContent(document.body);
    }

    // Limit content length
    return content.substring(0, 3000);
  }

  private extractTextContent(element: Element): string {
    // Remove script and style elements
    const clone = element.cloneNode(true) as Element;
    const scripts = clone.querySelectorAll('script, style, nav, footer, header, .ads, .advertisement');
    scripts.forEach(script => script.remove());
    
    return clone.textContent?.trim() || '';
  }

  async provideChatWithBlog(context: GeneralContext, selectedText: string, userQuery: string): Promise<GeminiResponse> {
    if (!this.geminiService) {
      return {
        type: 'error',
        content: 'AI service not available. Please configure your API key.'
      };
    }

    const prompt = this.buildBlogChatPrompt(context, selectedText, userQuery);
    
    try {
      const response = await this.geminiService.generateSocraticResponse({
        type: 'general',
        context: { ...context, selectedText },
        userQuery,
        requestedFeature: undefined
      });

      return response;
    } catch (error) {
      console.error('Error in chat with blog:', error);
      return {
        type: 'error',
        content: 'I encountered an error while analyzing the content. Please try again.'
      };
    }
  }

  async provideInstantHelp(context: GeneralContext, selectedText: string): Promise<GeminiResponse> {
    if (!this.geminiService) {
      return {
        type: 'error',
        content: 'AI service not available. Please configure your API key.'
      };
    }

    let helpType = this.determineHelpType(selectedText, context);
    let prompt = this.buildInstantHelpPrompt(context, selectedText, helpType);

    try {
      // Get API key through the secure key manager
      const { SecureKeyManager } = await import('./secureKeyManager');
      const keyManager = SecureKeyManager.getInstance();
      const apiKey = await keyManager.getApiKey();
      
      if (!apiKey) {
        throw new Error('API key not configured');
      }

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to provide help at this time.';
      
      return {
        type: 'hint',
        content,
        nextSteps: this.generateNextSteps(helpType, selectedText)
      };
    } catch (error) {
      console.error('Error providing instant help:', error);
      return {
        type: 'error',
        content: 'I encountered an error while providing help. Please try again.'
      };
    }
  }

  async provideCodingHints(context: GeneralContext, selectedCode: string, errorMessage?: string): Promise<GeminiResponse> {
    if (!this.geminiService) {
      return {
        type: 'error',
        content: 'AI service not available. Please configure your API key.'
      };
    }

    const prompt = this.buildCodingHintsPrompt(context, selectedCode, errorMessage);
    
    try {
      // Get API key through the secure key manager
      const { SecureKeyManager } = await import('./secureKeyManager');
      const keyManager = SecureKeyManager.getInstance();
      const apiKey = await keyManager.getApiKey();
      
      if (!apiKey) {
        throw new Error('API key not configured');
      }

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to provide coding hints at this time.';
      
      return {
        type: 'hint',
        content,
        nextSteps: [
          'Review the highlighted code section',
          'Consider the error message if provided',
          'Try implementing one suggestion at a time',
          'Test your changes incrementally'
        ]
      };
    } catch (error) {
      console.error('Error providing coding hints:', error);
      return {
        type: 'error',
        content: 'I encountered an error while analyzing the code. Please try again.'
      };
    }
  }

  async explainErrorCode(errorMessage: string, context: GeneralContext, relatedCode?: string): Promise<GeminiResponse> {
    if (!this.geminiService) {
      return {
        type: 'error',
        content: 'AI service not available. Please configure your API key.'
      };
    }

    const prompt = this.buildErrorExplanationPrompt(errorMessage, context, relatedCode);
    
    try {
      // Get API key through the secure key manager
      const { SecureKeyManager } = await import('./secureKeyManager');
      const keyManager = SecureKeyManager.getInstance();
      const apiKey = await keyManager.getApiKey();
      
      if (!apiKey) {
        throw new Error('API key not configured');
      }

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to explain this error at this time.';
      
      return {
        type: 'hint',
        content,
        nextSteps: [
          'Understand what caused the error',
          'Look for the specific line mentioned in the error',
          'Apply the suggested solution step by step',
          'Test to verify the fix works'
        ]
      };
    } catch (error) {
      console.error('Error explaining error code:', error);
      return {
        type: 'error',
        content: 'I encountered an error while explaining the error. Please try again.'
      };
    }
  }

  private determineHelpType(selectedText: string, context: GeneralContext): string {
    const text = selectedText.toLowerCase();
    const url = context.url.toLowerCase();

    // Code-related keywords
    if (text.includes('function') || text.includes('class') || text.includes('import') || 
        text.includes('const') || text.includes('var') || text.includes('let') ||
        text.includes('def ') || text.includes('public ') || text.includes('private ') ||
        /\{|\}|\(|\)|;/.test(selectedText)) {
      return 'code';
    }

    // Error messages
    if (text.includes('error') || text.includes('exception') || text.includes('traceback') ||
        text.includes('undefined') || text.includes('null reference') || text.includes('syntax')) {
      return 'error';
    }

    // Technical concepts
    if (url.includes('stackoverflow') || url.includes('github') || url.includes('documentation') ||
        url.includes('tutorial') || url.includes('docs')) {
      return 'technical';
    }

    // Academic content
    if (text.length > 100 && (text.includes('theorem') || text.includes('algorithm') || 
        text.includes('definition') || text.includes('concept'))) {
      return 'academic';
    }

    return 'general';
  }

  private buildBlogChatPrompt(context: GeneralContext, selectedText: string, userQuery: string): string {
    return `You are a helpful learning assistant helping a user understand content from a blog or article.

Context:
- Page: ${context.title}
- URL: ${context.url}
- Selected text: "${selectedText}"
- User question: "${userQuery}"

Article content (excerpt):
${context.pageContent?.substring(0, 1500) || 'Content not available'}

Provide a helpful, educational response that:
1. Directly addresses the user's question about the selected content
2. Explains concepts in simple terms
3. Provides relevant context from the article
4. Suggests related topics to explore
5. Encourages deeper understanding

Keep your response conversational and educational. Use Socratic questioning when appropriate to guide learning.`;
  }

  private buildInstantHelpPrompt(context: GeneralContext, selectedText: string, helpType: string): string {
    const typeSpecificInstructions = {
      'code': 'Focus on explaining the code syntax, logic, and potential improvements. Break down complex code into understandable parts.',
      'error': 'Explain what the error means, why it occurs, and provide clear steps to resolve it.',
      'technical': 'Explain technical concepts in simple terms with practical examples.',
      'academic': 'Break down complex academic concepts into digestible explanations with examples.',
      'general': 'Provide clear, helpful explanations that enhance understanding.'
    };

    return `Provide instant, helpful explanation for this selected text.

Context:
- Page: ${context.title}
- URL: ${context.url}
- Help type: ${helpType}
- Selected text: "${selectedText}"

${typeSpecificInstructions[helpType as keyof typeof typeSpecificInstructions]}

Page content for context:
${context.pageContent?.substring(0, 1000) || 'Content not available'}

Provide a clear, concise explanation that:
1. Explains what the selected text means
2. Provides relevant context
3. Offers practical insights
4. Suggests what to learn next

Keep the explanation focused and educational.`;
  }

  private buildCodingHintsPrompt(context: GeneralContext, selectedCode: string, errorMessage?: string): string {
    return `Provide helpful coding hints and guidance for this code.

Context:
- Page: ${context.title}
- URL: ${context.url}
${errorMessage ? `- Error message: ${errorMessage}` : ''}

Selected code:
\`\`\`
${selectedCode}
\`\`\`

Provide helpful hints that:
1. Explain what the code is trying to do
2. Identify potential issues or improvements
3. Suggest best practices
4. Guide toward better solutions without giving direct answers
5. Explain error messages if provided

Use a teaching approach - guide the learner to understand rather than just giving the solution.`;
  }

  private buildErrorExplanationPrompt(errorMessage: string, context: GeneralContext, relatedCode?: string): string {
    return `Explain this error message in a helpful, educational way.

Context:
- Page: ${context.title}
- URL: ${context.url}

Error message:
${errorMessage}

${relatedCode ? `Related code:
\`\`\`
${relatedCode}
\`\`\`` : ''}

Provide a clear explanation that:
1. Explains what the error means in simple terms
2. Identifies the likely cause
3. Provides step-by-step guidance to fix it
4. Explains how to prevent similar errors
5. Includes educational context about why this error occurs

Focus on teaching the underlying concepts, not just fixing the immediate problem.`;
  }

  private generateNextSteps(helpType: string, selectedText: string): string[] {
    const commonSteps = [
      'Think about how this relates to what you already know',
      'Try to apply this concept to a different example',
      'Look for connections to broader topics'
    ];

    const typeSpecificSteps = {
      'code': [
        'Try modifying the code to see how it behaves',
        'Look up documentation for unfamiliar functions',
        'Practice with similar code examples'
      ],
      'error': [
        'Understand the root cause of the error',
        'Create a test case to reproduce the issue',
        'Learn about error handling best practices'
      ],
      'technical': [
        'Research the underlying technology or concept',
        'Find practical examples and tutorials',
        'Join communities discussing this topic'
      ],
      'academic': [
        'Find additional resources on this topic',
        'Work through related practice problems',
        'Connect this concept to real-world applications'
      ],
      'general': commonSteps
    };

    return [...(typeSpecificSteps[helpType as keyof typeof typeSpecificSteps] || commonSteps), ...commonSteps].slice(0, 4);
  }
}