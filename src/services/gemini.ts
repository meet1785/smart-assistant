import { GeminiResponse, TutorRequest } from '../types/index';
import { config } from '../config/config';
import { SecureKeyManager } from './secureKeyManager';

export class GeminiService {
  private baseUrl = config.GEMINI_BASE_URL;
  private keyManager = SecureKeyManager.getInstance();

  constructor() {
    // No API key in constructor - retrieved securely when needed
  }

  async generateResponse(request: TutorRequest): Promise<GeminiResponse> {
    try {
      // Get API key securely
      const apiKey = await this.keyManager.getApiKey();
      if (!apiKey) {
        throw new Error('API key not configured. Please set it in the extension popup.');
      }
      
      const prompt = this.buildLeecoPrompt(request);
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: config.DEFAULT_TEMPERATURE,
            topK: config.DEFAULT_TOP_K,
            topP: config.DEFAULT_TOP_P,
            maxOutputTokens: config.DEFAULT_MAX_TOKENS,
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error response:', errorText);
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      return this.parseGeminiResponse(text);
    } catch (error) {
      console.error('Gemini API error:', error);
      return {
        type: 'error',
        content: 'Sorry, I encountered an error. Please try again. ' + (error as Error).message,
      };
    }
  }

  private buildLeecoPrompt(request: TutorRequest): string {
    const baseInstructions = `You are Leeco AI, an advanced AI learning companion designed to provide direct, helpful assistance for coding interview preparation and educational content consumption. Your role is to provide clear explanations, progressive hints, debugging assistance, and comprehensive learning support. Always respond in JSON format with the structure: {"type": "hint|explanation|solution|analysis|encouragement", "content": "your response", "nextSteps": ["step1", "step2"]}.

Key capabilities:
- Provide clear, direct explanations and solutions when requested
- Offer progressive hints that build toward complete understanding
- Debug code issues and suggest improvements
- Analyze time/space complexity with detailed explanations
- Generate interview questions and provide feedback
- Summarize educational content effectively
- Create interactive learning experiences`;

    if (request.type === 'leetcode') {
      const problem = request.context as any;
      let contextualInstructions = '';
      
      // Add specific guidance based on requested feature
      if (request.requestedFeature === 'approach') {
        contextualInstructions = `\nProvide comprehensive approach guidance:
- Explain the optimal algorithmic approach clearly
- Discuss alternative solutions and trade-offs
- Provide step-by-step problem-solving methodology
- Include time and space complexity analysis`;
      } else if (request.requestedFeature === 'testcases') {
        contextualInstructions = `\nHelp analyze and create test cases:
- Explain how to approach test case creation
- Identify edge cases and boundary conditions
- Provide example test cases with explanations
- Debug failing test cases with specific guidance`;
      } else if (request.requestedFeature === 'errors') {
        contextualInstructions = `\nProvide debugging assistance:
- Analyze the error and identify the root cause
- Explain what the error message means
- Provide specific steps to fix the issue
- Suggest best practices to avoid similar errors`;
      } else if (request.requestedFeature === 'hints') {
        contextualInstructions = `\nProvide progressive hints:
- Start with conceptual hints about the approach
- Progress to implementation-specific guidance
- Build understanding step by step
- Provide complete guidance when needed`;
      }

      return `${baseInstructions}

Context: LeetCode Problem Analysis
Title: ${problem.title}
Difficulty: ${problem.difficulty}
Description: ${problem.description}
${problem.selectedCode ? `Current Code: ${problem.selectedCode}` : ''}
${problem.language ? `Language: ${problem.language}` : ''}
${request.userQuery ? `User Question: ${request.userQuery}` : ''}${contextualInstructions}

Provide comprehensive assistance for this coding problem, focusing on:
- Clear problem analysis and optimal solutions
- Implementation guidance and code review
- Debugging and optimization suggestions
- Interview preparation and complexity analysis

Respond in JSON format.`;
    } else if (request.type === 'youtube') {
      const youtube = request.context as any;
      let contextualInstructions = '';
      
      if (request.requestedFeature === 'quiz') {
        contextualInstructions = `\nGenerate interactive quiz content:
- Create multiple-choice and open-ended questions based on the video
- Focus on key concepts and practical applications
- Provide detailed explanations for correct answers
- Include difficulty levels from basic to advanced`;
      } else if (request.requestedFeature === 'summary') {
        contextualInstructions = `\nProvide comprehensive video summarization:
- Extract and organize the main points effectively
- Highlight key takeaways and actionable insights
- Structure information in logical, digestible segments
- Include timestamps for important sections when available`;
      } else if (request.requestedFeature === 'sections') {
        contextualInstructions = `\nAnalyze and segment video content:
- Identify natural topic transitions and sections
- Explain how different concepts connect and build upon each other
- Provide clear section headings and descriptions
- Highlight the learning progression throughout the video`;
      }

      return `${baseInstructions}

Context: YouTube Educational Content Analysis
Video: ${youtube.title}
${youtube.selectedText ? `Selected Text: ${youtube.selectedText}` : ''}
${youtube.timestamp ? `Current Timestamp: ${youtube.timestamp}s` : ''}
${youtube.transcript ? `Transcript Excerpt: ${youtube.transcript.substring(0, 500)}...` : ''}
${request.userQuery ? `User Question: ${request.userQuery}` : ''}${contextualInstructions}

Provide comprehensive assistance for this educational video content, focusing on:
- Clear explanations and content analysis
- Interactive learning features (quizzes, summaries)
- Practical applications and real-world connections
- Enhanced comprehension and retention

Respond in JSON format.`;
    } else {
      // General context (blogs, articles, etc.)
      const general = request.context as any;
      return `${baseInstructions}

Context: General Educational Content
Page: ${general.title}
URL: ${general.url}
${general.selectedText ? `Selected Text: ${general.selectedText}` : ''}
${general.pageContent ? `Content Excerpt: ${general.pageContent.substring(0, 500)}...` : ''}
${request.userQuery ? `User Question: ${request.userQuery}` : ''}

Provide comprehensive assistance for this web content, focusing on:
- Clear explanations and concept clarification
- Practical applications and examples
- Connections to broader knowledge domains
- Learning enhancement and skill development

Respond in JSON format.`;
    }
  }

  private parseGeminiResponse(text: string): GeminiResponse {
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          type: parsed.type || 'hint',
          content: parsed.content || text,
          nextSteps: parsed.nextSteps || []
        };
      }
      
      // Fallback: create a structured response for direct assistance
      return {
        type: 'hint',
        content: text,
        nextSteps: []
      };
    } catch (error) {
      return {
        type: 'hint',
        content: text,
        nextSteps: []
      };
    }
  }
}