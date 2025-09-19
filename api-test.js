// Simple API test using Node.js fetch
const API_KEY = ''; // Configure through extension popup
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

async function testGeminiAPI() {
  console.log('Testing Gemini API key...');
  
  try {
    const response = await fetch(`${BASE_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Hello! Please respond with a brief confirmation that you are working correctly.'
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 100,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response text found';
    
    console.log('✅ API Test Successful!');
    console.log('Response:', text);
    console.log('\nAPI key is working correctly and ready for use in the extension.');
    
  } catch (error) {
    console.error('❌ API Test Failed:', error.message);
  }
}

testGeminiAPI();