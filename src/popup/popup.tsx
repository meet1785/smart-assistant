import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

const Popup: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    checkApiKeyStatus();
  }, []);

  const checkApiKeyStatus = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getApiKeyStatus' });
      setHasApiKey(response.hasApiKey);
      if (response.hasApiKey) {
        setMessage('API key is configured ✓');
      }
    } catch (error) {
      console.error('Error checking API key status:', error);
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      setMessage('Please enter a valid API key');
      return;
    }

    setIsLoading(true);
    try {
      const response = await chrome.runtime.sendMessage({ 
        action: 'setApiKey', 
        apiKey: apiKey.trim() 
      });
      
      if (response.success) {
        setHasApiKey(true);
        setMessage('API key saved successfully! ✓');
        setApiKey('');
      } else {
        setMessage('Failed to save API key. Please try again.');
      }
    } catch (error) {
      setMessage('Error saving API key. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const openGeminiApiPage = () => {
    chrome.tabs.create({ 
      url: 'https://makersuite.google.com/app/apikey' 
    });
  };

  return (
    <div className="popup-container">
      <div className="popup-header">
        <h1>🎓 LearnAI</h1>
        <p>Socratic Learning Assistant</p>
      </div>
      
      <div className="popup-content">
        {!hasApiKey ? (
          <div className="setup-section">
            <h3>Setup Required</h3>
            <p>To use LearnAI, you need a Google Gemini API key:</p>
            
            <ol>
              <li>
                <button 
                  className="link-button" 
                  onClick={openGeminiApiPage}
                >
                  Get your free Gemini API key
                </button>
              </li>
              <li>Copy the API key</li>
              <li>Paste it below</li>
            </ol>
            
            <div className="input-group">
              <label htmlFor="apiKey">Gemini API Key:</label>
              <input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                className="api-key-input"
              />
              <button 
                onClick={handleSaveApiKey}
                disabled={isLoading || !apiKey.trim()}
                className="save-button"
              >
                {isLoading ? 'Saving...' : 'Save Key'}
              </button>
            </div>
          </div>
        ) : (
          <div className="ready-section">
            <div className="status-indicator">
              <span className="status-icon">✅</span>
              <span>Ready to help you learn!</span>
            </div>
            
            <div className="usage-info">
              <h3>How to use LearnAI:</h3>
              
              <div className="platform-info">
                <h4>🔢 On LeetCode:</h4>
                <ul>
                  <li>Click the "🎓 Get AI Help" button on any problem</li>
                  <li>Select code text for contextual hints</li>
                  <li>Press <kbd>Ctrl</kbd>+<kbd>/</kbd> in the code editor</li>
                </ul>
              </div>
              
              <div className="platform-info">
                <h4>📺 On YouTube:</h4>
                <ul>
                  <li>Click the floating "🎓 Ask LearnAI" button</li>
                  <li>Select text from descriptions or comments</li>
                  <li>Press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd></li>
                </ul>
              </div>
              
              <div className="philosophy">
                <h4>💡 Learning Philosophy:</h4>
                <p>LearnAI acts as a Socratic tutor - it won't give you direct answers but will guide you to discover solutions through questions and hints.</p>
              </div>
            </div>
            
            <button 
              className="reconfigure-button"
              onClick={() => {
                setHasApiKey(false);
                setMessage('');
              }}
            >
              Reconfigure API Key
            </button>
          </div>
        )}
        
        {message && (
          <div className={`message ${message.includes('✓') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </div>
      
      <div className="popup-footer">
        <p>Powered by Google Gemini AI</p>
      </div>
    </div>
  );
};

// Initialize the popup
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<Popup />);
}