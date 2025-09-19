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
- Celebrate progress and learning milestones`;

    if (request.type === 'leetcode') {
      const problem = request.context as any;
      return `${baseInstructions}

Context: LeetCode Problem
Title: ${problem.title}
Difficulty: ${problem.difficulty}
Description: ${problem.description}
${problem.selectedCode ? `Selected Code: ${problem.selectedCode}` : ''}
${problem.language ? `Language: ${problem.language}` : ''}
${request.userQuery ? `User Question: ${request.userQuery}` : ''}

Help the user understand this coding problem through Socratic questioning. Focus on:
- Problem comprehension
- Algorithm design thinking
- Code structure and logic
- Edge cases and optimization

Respond in JSON format.`;
    } else {
      const youtube = request.context as any;
      return `${baseInstructions}

Context: YouTube Video Learning
Video: ${youtube.title}
${youtube.selectedText ? `Selected Text: ${youtube.selectedText}` : ''}
${youtube.timestamp ? `Timestamp: ${youtube.timestamp}s` : ''}
${request.userQuery ? `User Question: ${request.userQuery}` : ''}

Help the user understand this video content through Socratic questioning. Focus on:
- Key concepts and ideas
- Connections to prior knowledge  
- Critical analysis of the content
- Application of learned concepts

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