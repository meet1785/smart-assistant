// Test script to verify Gemini API integration
import { GeminiService } from '../services/gemini';
import { config } from '../config/config';

// Test function to verify API key and basic functionality
async function testGeminiAPI() {
  console.log('Starting Gemini API tests...');
  
  // Test 1: Initialize service
  console.log('\n1. Testing service initialization...');
  const geminiService = new GeminiService();
  console.log('✓ GeminiService initialized');
  
  // Test 2: Test basic LeetCode tutoring
  console.log('\n2. Testing LeetCode tutoring...');
  const leetcodeRequest = {
    type: 'leetcode' as const,
    context: {
      title: 'Two Sum',
      difficulty: 'Easy',
      description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
      selectedCode: 'function twoSum(nums, target) { return []; }',
      language: 'javascript'
    },
    requestedFeature: 'approach' as const,
    userQuery: 'How should I approach this problem?'
  };
  
  try {
    const response = await geminiService.generateResponse(leetcodeRequest);
    console.log('✓ LeetCode response received:', {
      type: response.type,
      contentLength: response.content.length,
      hasNextSteps: response.nextSteps && response.nextSteps.length > 0
    });
  } catch (error) {
    console.error('✗ LeetCode test failed:', error);
  }
  
  // Test 3: Test YouTube tutoring
  console.log('\n3. Testing YouTube tutoring...');
  const youtubeRequest = {
    type: 'youtube' as const,
    context: {
      title: 'Introduction to Algorithms',
      selectedText: 'Algorithms are step-by-step procedures for solving problems.',
      timestamp: 120,
      transcript: 'In this video, we will learn about different types of algorithms and their applications.'
    },
    requestedFeature: 'quiz' as const,
    userQuery: 'Can you help me understand algorithms better?'
  };
  
  try {
    const response = await geminiService.generateResponse(youtubeRequest);
    console.log('✓ YouTube response received:', {
      type: response.type,
      contentLength: response.content.length,
      hasNextSteps: response.nextSteps && response.nextSteps.length > 0
    });
  } catch (error) {
    console.error('✗ YouTube test failed:', error);
  }
  
  // Test 4: Test general content tutoring
  console.log('\n4. Testing general content tutoring...');
  const generalRequest = {
    type: 'general' as const,
    context: {
      title: 'JavaScript Fundamentals',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
      selectedText: 'JavaScript is a programming language that adds interactivity to your website.',
      pageContent: 'JavaScript is a versatile programming language used for web development...'
    },
    requestedFeature: undefined,
    userQuery: 'What are the key concepts I should focus on?'
  };
  
  try {
    const response = await geminiService.generateResponse(generalRequest);
    console.log('✓ General content response received:', {
      type: response.type,
      contentLength: response.content.length,
      hasNextSteps: response.nextSteps && response.nextSteps.length > 0
    });
  } catch (error) {
    console.error('✗ General content test failed:', error);
  }
  
  console.log('\n🎉 API tests completed!');
}

// Test the API if this script is run directly
if (typeof window === 'undefined') {
  testGeminiAPI().catch(console.error);
}

export { testGeminiAPI };