import { GeminiService } from './gemini';
import { VideoSection, Quiz, QuizQuestion, YouTubeContext } from '../types/index';

export class YouTubeEnhancer {
  private geminiService: GeminiService | null = null;

  constructor(geminiService: GeminiService | null) {
    this.geminiService = geminiService;
  }

  async generateSmartSections(context: YouTubeContext): Promise<VideoSection[]> {
    if (!this.geminiService) {
      throw new Error('Gemini service not available');
    }

    const prompt = this.buildSmartSectionsPrompt(context);
    
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': (this.geminiService as any).apiKey
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      return this.parseSmartSections(text);
    } catch (error) {
      console.error('Error generating smart sections:', error);
      return [];
    }
  }

  async generateVideoSummary(context: YouTubeContext): Promise<string> {
    if (!this.geminiService) {
      throw new Error('Gemini service not available');
    }

    const prompt = `Please provide a comprehensive summary of this YouTube video:

Title: ${context.title}
${context.transcript ? `Transcript: ${context.transcript.substring(0, 2000)}...` : ''}
${context.selectedText ? `User is focusing on: ${context.selectedText}` : ''}

Create a structured summary that includes:
1. Main topic and key learning objectives
2. Important concepts covered
3. Key takeaways and insights
4. Practical applications
5. Further learning suggestions

Format as clear, readable text with bullet points and sections.`;

    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': (this.geminiService as any).apiKey
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate summary';
    } catch (error) {
      console.error('Error generating summary:', error);
      return 'Error generating summary. Please try again.';
    }
  }

  async generateInteractiveQuiz(context: YouTubeContext, sections: VideoSection[] = []): Promise<Quiz> {
    if (!this.geminiService) {
      throw new Error('Gemini service not available');
    }

    const prompt = this.buildQuizPrompt(context, sections);
    
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': (this.geminiService as any).apiKey
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      return this.parseQuiz(text, context.title);
    } catch (error) {
      console.error('Error generating quiz:', error);
      return this.createFallbackQuiz(context.title);
    }
  }

  async enhanceChatWithVideo(context: YouTubeContext, userQuery: string): Promise<string> {
    if (!this.geminiService) {
      throw new Error('Gemini service not available');
    }

    const prompt = `You are a knowledgeable tutor discussing this YouTube video with a student. 

Video Context:
- Title: ${context.title}
- Current timestamp: ${context.timestamp ? `${Math.floor(context.timestamp / 60)}:${(context.timestamp % 60).toString().padStart(2, '0')}` : 'Unknown'}
${context.transcript ? `- Transcript excerpt: ${context.transcript.substring(0, 1500)}...` : ''}
${context.selectedText ? `- Student selected: "${context.selectedText}"` : ''}

Student's Question: "${userQuery}"

Provide a helpful, educational response that:
1. Directly addresses their question about the video content
2. References specific parts of the video when relevant
3. Connects concepts to broader learning
4. Encourages further exploration
5. Uses a conversational, supportive tone

Keep the response focused and practical while being encouraging.`;

    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': (this.geminiService as any).apiKey
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'I understand your question, but I need more context to provide a helpful answer.';
    } catch (error) {
      console.error('Error enhancing chat with video:', error);
      return 'I apologize, but I encountered an error while processing your question. Please try rephrasing it.';
    }
  }

  private buildSmartSectionsPrompt(context: YouTubeContext): string {
    return `Analyze this YouTube video and create intelligent sections that break down the content into digestible learning segments.

Video: ${context.title}
${context.transcript ? `Transcript: ${context.transcript}` : ''}

Create 3-7 logical sections with the following JSON format:
{
  "sections": [
    {
      "title": "Section Name",
      "startTime": 0,
      "endTime": 120,
      "summary": "Brief description of what this section covers",
      "keyPoints": ["Point 1", "Point 2", "Point 3"]
    }
  ]
}

Focus on:
- Natural topic transitions
- Educational value
- Reasonable section lengths (2-5 minutes each)
- Clear, descriptive titles
- Actionable key points

Respond only with valid JSON.`;
  }

  private buildQuizPrompt(context: YouTubeContext, sections: VideoSection[]): string {
    const sectionContext = sections.length > 0 
      ? `\nVideo Sections:\n${sections.map(s => `- ${s.title}: ${s.summary}`).join('\n')}`
      : '';

    return `Create an interactive quiz based on this YouTube video content to test understanding and reinforce learning.

Video: ${context.title}${sectionContext}
${context.transcript ? `\nKey content: ${context.transcript.substring(0, 1000)}...` : ''}

Generate a quiz with 4-6 multiple choice questions that:
- Test key concepts and understanding
- Include practical applications
- Vary in difficulty (some easier, some challenging)
- Have clear, educational explanations

Use this JSON format:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Detailed explanation of why this answer is correct and what the concept means"
    }
  ]
}

Make questions engaging and educational. Respond only with valid JSON.`;
  }

  private parseSmartSections(text: string): VideoSection[] {
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      if (parsed.sections && Array.isArray(parsed.sections)) {
        return parsed.sections.map((section: any) => ({
          title: section.title || 'Untitled Section',
          startTime: section.startTime || 0,
          endTime: section.endTime || 60,
          summary: section.summary || 'No summary available',
          keyPoints: section.keyPoints || []
        }));
      }
    } catch (error) {
      console.error('Error parsing smart sections:', error);
    }

    // Fallback: return generic sections
    return [
      {
        title: 'Introduction',
        startTime: 0,
        endTime: 60,
        summary: 'Video introduction and overview',
        keyPoints: ['Main topic introduction'],
        difficulty: 'beginner' as const,
        concepts: ['introduction'],
        relatedSections: []
      },
      {
        title: 'Main Content',
        startTime: 60,
        endTime: 180,
        summary: 'Core content and concepts',
        keyPoints: ['Key concepts', 'Important details'],
        difficulty: 'intermediate' as const,
        concepts: ['main concepts'],
        relatedSections: []
      },
      {
        title: 'Conclusion',
        startTime: 180,
        endTime: 240,
        summary: 'Summary and final thoughts',
        keyPoints: ['Key takeaways', 'Next steps'],
        difficulty: 'beginner' as const,
        concepts: ['summary'],
        relatedSections: []
      }
    ];
  }

  private parseQuiz(text: string, videoTitle: string): Quiz {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      if (parsed.questions && Array.isArray(parsed.questions)) {
        const questions: QuizQuestion[] = parsed.questions.map((q: any, index: number) => ({
          id: `q_${index}_${Date.now()}`,
          question: q.question || 'Sample question?',
          options: q.options || ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
          explanation: q.explanation || 'No explanation provided.'
        }));

        return {
          id: `quiz_${Date.now()}`,
          questions,
          attempts: 0
        };
      }
    } catch (error) {
      console.error('Error parsing quiz:', error);
    }

    return this.createFallbackQuiz(videoTitle);
  }

  private createFallbackQuiz(videoTitle: string): Quiz {
    return {
      id: `quiz_${Date.now()}`,
      questions: [
        {
          id: 'fallback_1',
          question: `What was the main topic of the video "${videoTitle}"?`,
          options: [
            'Educational content',
            'Entertainment',
            'Tutorial',
            'Review'
          ],
          correctAnswer: 0,
          explanation: 'This video appears to contain educational content based on the context.'
        },
        {
          id: 'fallback_2',
          question: 'What is the best way to learn from educational videos?',
          options: [
            'Watch passively',
            'Take notes and ask questions',
            'Watch at high speed',
            'Skip difficult parts'
          ],
          correctAnswer: 1,
          explanation: 'Active learning through note-taking and questioning helps retain information better.'
        }
      ],
      attempts: 0
    };
  }
}