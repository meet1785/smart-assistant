import React, { useState, useEffect, useRef } from 'react';
import { VoiceInteraction } from '../types/index';

// Speech API type definitions
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface VoiceAssistantProps {
  onClose: () => void;
  onVoiceQuery: (query: string) => void;
}

export const VoiceAssistantComponent: React.FC<VoiceAssistantProps> = ({ 
  onClose, 
  onVoiceQuery 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [voiceHistory, setVoiceHistory] = useState<VoiceInteraction[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [continuousMode, setContinuousMode] = useState(false);
  const [voiceResponse, setVoiceResponse] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const languages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' },
    { code: 'ja-JP', name: 'Japanese' },
    { code: 'ko-KR', name: 'Korean' },
    { code: 'zh-CN', name: 'Chinese (Simplified)' },
    { code: 'hi-IN', name: 'Hindi' },
    { code: 'pt-BR', name: 'Portuguese (Brazil)' }
  ];

  useEffect(() => {
    initializeSpeechRecognition();
    loadVoiceHistory();
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const initializeSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = continuousMode;
    recognition.interimResults = true;
    recognition.lang = selectedLanguage;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
          setConfidence(result[0].confidence);
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      setTranscript(finalTranscript + interimTranscript);

      if (finalTranscript && !continuousMode) {
        processVoiceCommand(finalTranscript.trim());
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (continuousMode && transcript.trim()) {
        processVoiceCommand(transcript.trim());
      }
    };

    recognitionRef.current = recognition;
    synthRef.current = window.speechSynthesis;
  };

  const loadVoiceHistory = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getVoiceHistory' });
      if (response && response.success) {
        setVoiceHistory(response.data);
      }
    } catch (error) {
      console.error('Failed to load voice history:', error);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const processVoiceCommand = async (command: string) => {
    if (!command.trim()) return;

    setIsProcessing(true);
    
    try {
      // Process the voice command through the AI tutor
      const response = await chrome.runtime.sendMessage({
        action: 'processVoiceCommand',
        data: {
          query: command,
          language: selectedLanguage,
          confidence: confidence
        }
      });

      if (response && response.success) {
        const voiceInteraction: VoiceInteraction = {
          sessionId: Date.now().toString(),
          query: command,
          response: response.data.response,
          accuracy: confidence,
          language: selectedLanguage,
          timestamp: Date.now()
        };

        setVoiceHistory(prev => [voiceInteraction, ...prev]);
        setVoiceResponse(response.data.response);
        
        // Speak the response if text-to-speech is enabled
        speakResponse(response.data.response);
        
        // Also trigger the parent callback
        onVoiceQuery(command);
      }
    } catch (error) {
      console.error('Failed to process voice command:', error);
    } finally {
      setIsProcessing(false);
      setTranscript('');
    }
  };

  const speakResponse = (text: string) => {
    if (!synthRef.current || isSpeaking) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLanguage;
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const clearHistory = () => {
    setVoiceHistory([]);
    chrome.runtime.sendMessage({ action: 'clearVoiceHistory' });
  };

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'confidence-high';
    if (confidence >= 0.6) return 'confidence-medium';
    return 'confidence-low';
  };

  return (
    <div className="voice-assistant-container">
      <div className="voice-header">
        <h2>🎤 Voice Assistant</h2>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="voice-controls">
        <div className="control-row">
          <select 
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="language-select"
            disabled={isListening}
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>

          <div className="mode-toggle">
            <label>
              <input
                type="checkbox"
                checked={continuousMode}
                onChange={(e) => setContinuousMode(e.target.checked)}
                disabled={isListening}
              />
              Continuous Mode
            </label>
          </div>
        </div>

        <div className="voice-actions">
          {!isListening ? (
            <button 
              className="btn-primary voice-btn start-btn"
              onClick={startListening}
              disabled={isProcessing}
            >
              <span className="btn-icon">🎤</span>
              Start Listening
            </button>
          ) : (
            <button 
              className="btn-danger voice-btn stop-btn listening"
              onClick={stopListening}
            >
              <span className="btn-icon pulse">🔴</span>
              Stop Listening
            </button>
          )}

          {isSpeaking && (
            <button 
              className="btn-secondary voice-btn"
              onClick={stopSpeaking}
            >
              <span className="btn-icon">🔇</span>
              Stop Speaking
            </button>
          )}
        </div>
      </div>

      <div className="voice-status">
        {isListening && (
          <div className="listening-indicator">
            <div className="pulse-circle"></div>
            <span>Listening...</span>
          </div>
        )}

        {isProcessing && (
          <div className="processing-indicator">
            <div className="spinner"></div>
            <span>Processing your command...</span>
          </div>
        )}

        {transcript && (
          <div className="current-transcript">
            <h4>Current Speech:</h4>
            <p className={getConfidenceColor(confidence)}>
              {transcript}
              {confidence > 0 && (
                <span className="confidence-badge">
                  {Math.round(confidence * 100)}% confident
                </span>
              )}
            </p>
          </div>
        )}

        {voiceResponse && !isProcessing && (
          <div className="voice-response">
            <h4>AI Response:</h4>
            <p>{voiceResponse}</p>
            <div className="response-actions">
              <button 
                className="btn-secondary"
                onClick={() => speakResponse(voiceResponse)}
                disabled={isSpeaking}
              >
                {isSpeaking ? '🔊 Speaking...' : '🔊 Speak Again'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="voice-history">
        <div className="history-header">
          <h3>📜 Voice History</h3>
          <div className="history-actions">
            <button className="btn-secondary" onClick={clearHistory}>
              Clear History
            </button>
          </div>
        </div>

        <div className="history-list">
          {voiceHistory.map((interaction, index) => (
            <div key={index} className="history-item">
              <div className="interaction-header">
                <span className="timestamp">
                  {formatTimestamp(interaction.timestamp)}
                </span>
                <span className={`accuracy ${getConfidenceColor(interaction.accuracy)}`}>
                  {Math.round(interaction.accuracy * 100)}%
                </span>
              </div>
              
              <div className="interaction-content">
                <div className="user-query">
                  <strong>You:</strong> {interaction.query}
                </div>
                <div className="ai-response">
                  <strong>AI:</strong> {interaction.response}
                </div>
              </div>
              
              <div className="interaction-actions">
                <button 
                  className="btn-small"
                  onClick={() => speakResponse(interaction.response)}
                  disabled={isSpeaking}
                >
                  🔊 Repeat
                </button>
                <button 
                  className="btn-small"
                  onClick={() => onVoiceQuery(interaction.query)}
                >
                  🔄 Ask Again
                </button>
              </div>
            </div>
          ))}
        </div>

        {voiceHistory.length === 0 && (
          <div className="empty-history">
            <p>No voice interactions yet. Start by clicking "Start Listening"!</p>
          </div>
        )}
      </div>

      <div className="voice-tips">
        <h4>💡 Voice Tips:</h4>
        <ul>
          <li>Speak clearly and at a normal pace</li>
          <li>Use specific questions like "Explain bubble sort" or "Help with this function"</li>
          <li>Try commands like "Create flashcards" or "Take notes"</li>
          <li>Enable continuous mode for longer conversations</li>
        </ul>
      </div>
    </div>
  );
};

export default VoiceAssistantComponent;