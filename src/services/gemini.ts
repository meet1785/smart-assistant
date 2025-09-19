import { GeminiResponse, TutorRequest } from '../types/index';

export class GeminiService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateSocraticResponse(request: TutorRequest): Promise<GeminiResponse> {
    try {
      const prompt = this.buildSocraticPrompt(request);
      
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      return this.parseGeminiResponse(text);
    } catch (error) {
      console.error('Gemini API error:', error);
      return {
        type: 'error',
        content: 'Sorry, I encountered an error. Please try again.',
      };
    }
  }

  private buildSocraticPrompt(request: TutorRequest): string {
    const baseInstructions = `You are a Socratic tutor. Your role is to guide learning through questions and hints, NOT to provide direct answers. Always respond in JSON format with the structure: {"type": "question|hint|followup|encouragement", "content": "your response", "nextSteps": ["step1", "step2"]}.

Key principles:
- Ask thought-provoking questions that lead to understanding
- Provide hints that guide thinking without giving away solutions  
- Encourage problem-solving and critical thinking
- Break complex problems into smaller, manageable parts
- Celebrate progress and learning milestones
- Guide students to discover solutions themselves`;

    if (request.type === 'leetcode') {
      const problem = request.context as any;
      let contextualInstructions = '';
      
      // Add specific guidance based on requested feature
      if (request.requestedFeature === 'approach') {
        contextualInstructions = `\nFocus on helping the user develop a problem-solving approach:
- Guide them to understand the problem requirements
- Help them identify patterns and similar problems
- Lead them to consider different algorithmic approaches
- Ask questions about time and space complexity`;
      } else if (request.requestedFeature === 'testcases') {
        contextualInstructions = `\nHelp the user understand test cases:
- Guide them to think about edge cases
- Ask questions about input boundaries
- Help them trace through example inputs
- Lead them to consider corner cases`;
      } else if (request.requestedFeature === 'errors') {
        contextualInstructions = `\nHelp the user understand and debug errors:
- Guide them to identify the error source
- Ask questions about what the error message means
- Help them trace through their logic
- Lead them to find the fix themselves`;
      } else if (request.requestedFeature === 'hints') {
        contextualInstructions = `\nProvide progressive hints:
- Start with high-level conceptual hints
- Guide toward the right direction without giving away the solution
- Ask questions that unlock the next step
- Build understanding step by step`;
      }

      return `${baseInstructions}

Context: LeetCode Problem
Title: ${problem.title}
Difficulty: ${problem.difficulty}
Description: ${problem.description}
${problem.selectedCode ? `Selected Code: ${problem.selectedCode}` : ''}
${problem.language ? `Language: ${problem.language}` : ''}
${request.userQuery ? `User Question: ${request.userQuery}` : ''}${contextualInstructions}

Help the user understand this coding problem through Socratic questioning. Focus on:
- Problem comprehension and approach development
- Algorithm design thinking and pattern recognition
- Code structure, logic, and debugging
- Edge cases, optimization, and best practices

Respond in JSON format.`;
    } else if (request.type === 'youtube') {
      const youtube = request.context as any;
      let contextualInstructions = '';
      
      if (request.requestedFeature === 'quiz') {
        contextualInstructions = `\nHelp the user prepare for or review quiz content:
- Ask questions that test understanding of key concepts
- Guide them to think about practical applications
- Help them connect ideas from the video
- Lead them to deeper insights about the material`;
      } else if (request.requestedFeature === 'summary') {
        contextualInstructions = `\nHelp the user create meaningful summaries:
- Guide them to identify the main points
- Ask questions about key takeaways
- Help them organize information logically
- Lead them to synthesize complex ideas`;
      } else if (request.requestedFeature === 'sections') {
        contextualInstructions = `\nHelp the user understand video structure:
- Guide them to identify natural topic transitions
- Ask questions about how ideas connect
- Help them see the logical flow of information
- Lead them to recognize learning objectives`;
      }

      return `${baseInstructions}

Context: YouTube Video Learning
Video: ${youtube.title}
${youtube.selectedText ? `Selected Text: ${youtube.selectedText}` : ''}
${youtube.timestamp ? `Timestamp: ${youtube.timestamp}s` : ''}
${youtube.transcript ? `Transcript excerpt: ${youtube.transcript.substring(0, 500)}...` : ''}
${request.userQuery ? `User Question: ${request.userQuery}` : ''}${contextualInstructions}

Help the user understand this video content through Socratic questioning. Focus on:
- Key concepts and deeper understanding
- Connections to prior knowledge and real-world applications
- Critical analysis and evaluation of the content
- Practical application of learned concepts

Respond in JSON format.`;
    } else {
      // General context (blogs, articles, etc.)
      const general = request.context as any;
      return `${baseInstructions}

Context: General Web Content
Page: ${general.title}
URL: ${general.url}
${general.selectedText ? `Selected Text: ${general.selectedText}` : ''}
${general.pageContent ? `Content excerpt: ${general.pageContent.substring(0, 500)}...` : ''}
${request.userQuery ? `User Question: ${request.userQuery}` : ''}

Help the user understand this web content through Socratic questioning. Focus on:
- Comprehension of key ideas and concepts
- Critical thinking about the information presented
- Connections to broader knowledge and context
- Practical applications and implications

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
          type: parsed.type || 'question',
          content: parsed.content || text,
          nextSteps: parsed.nextSteps || []
        };
      }
      
      // Fallback: create a structured response
      return {
        type: 'question',
        content: text,
        nextSteps: []
      };
    } catch (error) {
      return {
        type: 'question',
        content: text,
        nextSteps: []
      };
    }
  }
}