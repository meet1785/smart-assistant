import React, { useState, useEffect } from 'react';
import { CodeAnalysis, CodeSuggestion, DetectedPattern, PerformanceMetric } from '../types/index';

interface CodeAnalyzerProps {
  initialCode?: string;
  language?: string;
  onClose: () => void;
}

export const CodeAnalyzerComponent: React.FC<CodeAnalyzerProps> = ({ 
  initialCode = '', 
  language = 'javascript',
  onClose 
}) => {
  const [code, setCode] = useState(initialCode);
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [analysis, setAnalysis] = useState<CodeAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'patterns' | 'performance' | 'security'>('suggestions');
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<number>>(new Set());

  const languages = [
    'javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'go', 'rust', 'php', 'ruby'
  ];

  useEffect(() => {
    if (initialCode) {
      analyzeCode();
    }
  }, []);

  const analyzeCode = async () => {
    if (!code.trim()) return;

    setIsAnalyzing(true);
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'analyzeCode',
        data: {
          code,
          language: selectedLanguage
        }
      });

      if (response && response.success) {
        setAnalysis(response.data);
      }
    } catch (error) {
      console.error('Failed to analyze code:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applySuggestion = (suggestionIndex: number) => {
    if (!analysis) return;

    const suggestion = analysis.analysis.suggestions[suggestionIndex];
    if (suggestion.before && suggestion.after) {
      const newCode = code.replace(suggestion.before, suggestion.after);
      setCode(newCode);
      setAppliedSuggestions(prev => new Set([...prev, suggestionIndex]));
    }
  };

  const getComplexityColor = (complexity: string): string => {
    if (complexity.includes('O(1)') || complexity.includes('O(log')) return 'complexity-good';
    if (complexity.includes('O(n)')) return 'complexity-ok';
    if (complexity.includes('O(n²)') || complexity.includes('O(2^')) return 'complexity-bad';
    return 'complexity-unknown';
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'severity-critical';
      case 'high': return 'severity-high';
      case 'medium': return 'severity-medium';
      case 'low': return 'severity-low';
      default: return 'severity-unknown';
    }
  };

  const renderSuggestions = () => {
    if (!analysis) return null;

    return (
      <div className="suggestions-section">
        <div className="section-header">
          <h3>💡 Code Suggestions</h3>
          <span className="suggestions-count">
            {analysis.analysis.suggestions.length} suggestions
          </span>
        </div>

        <div className="suggestions-list">
          {analysis.analysis.suggestions.map((suggestion, index) => (
            <div key={index} className={`suggestion-card impact-${suggestion.impact}`}>
              <div className="suggestion-header">
                <div className="suggestion-type">
                  {suggestion.type === 'optimization' && '⚡'}
                  {suggestion.type === 'refactor' && '🔄'}
                  {suggestion.type === 'best-practice' && '✨'}
                  {suggestion.type === 'bug-fix' && '🐛'}
                  <span>{suggestion.type}</span>
                </div>
                <div className="suggestion-meta">
                  <span className={`impact-${suggestion.impact}`}>
                    {suggestion.impact} impact
                  </span>
                  <span className="confidence">
                    {Math.round(suggestion.confidence * 100)}% confidence
                  </span>
                </div>
              </div>

              <p className="suggestion-description">{suggestion.description}</p>

              {suggestion.before && suggestion.after && (
                <div className="code-diff">
                  <div className="code-before">
                    <h5>Before:</h5>
                    <pre><code>{suggestion.before}</code></pre>
                  </div>
                  <div className="code-after">
                    <h5>After:</h5>
                    <pre><code>{suggestion.after}</code></pre>
                  </div>
                </div>
              )}

              <div className="suggestion-actions">
                <button 
                  className="btn-primary"
                  onClick={() => applySuggestion(index)}
                  disabled={appliedSuggestions.has(index)}
                >
                  {appliedSuggestions.has(index) ? '✅ Applied' : '🔧 Apply'}
                </button>
                <button className="btn-secondary">Learn More</button>
              </div>
            </div>
          ))}
        </div>

        {analysis.analysis.suggestions.length === 0 && (
          <div className="empty-state">
            <p>Great job! No suggestions for improvement found.</p>
          </div>
        )}
      </div>
    );
  };

  const renderPatterns = () => {
    if (!analysis) return null;

    return (
      <div className="patterns-section">
        <div className="section-header">
          <h3>🔍 Detected Patterns</h3>
          <span className="patterns-count">
            {analysis.analysis.patterns.length} patterns
          </span>
        </div>

        <div className="patterns-list">
          {analysis.analysis.patterns.map((pattern, index) => (
            <div key={index} className="pattern-card">
              <div className="pattern-header">
                <h4>{pattern.name}</h4>
                <span className="confidence">
                  {Math.round(pattern.confidence * 100)}% match
                </span>
              </div>
              
              <p className="pattern-description">{pattern.description}</p>
              
              <div className="pattern-location">
                <span>Lines {pattern.location.startLine} - {pattern.location.endLine}</span>
              </div>
              
              <div className="pattern-actions">
                <button className="btn-secondary">View Details</button>
                <button className="btn-primary">Learn Pattern</button>
              </div>
            </div>
          ))}
        </div>

        {analysis.analysis.patterns.length === 0 && (
          <div className="empty-state">
            <p>No specific patterns detected in this code.</p>
          </div>
        )}
      </div>
    );
  };

  const renderPerformance = () => {
    if (!analysis) return null;

    return (
      <div className="performance-section">
        <div className="complexity-overview">
          <div className="complexity-card">
            <h4>Time Complexity</h4>
            <span className={getComplexityColor(analysis.analysis.complexity.time)}>
              {analysis.analysis.complexity.time}
            </span>
          </div>
          <div className="complexity-card">
            <h4>Space Complexity</h4>
            <span className={getComplexityColor(analysis.analysis.complexity.space)}>
              {analysis.analysis.complexity.space}
            </span>
          </div>
          <div className="complexity-card">
            <h4>Cyclomatic Complexity</h4>
            <span className={analysis.analysis.complexity.cyclomatic > 10 ? 'complexity-bad' : 
                          analysis.analysis.complexity.cyclomatic > 5 ? 'complexity-ok' : 'complexity-good'}>
              {analysis.analysis.complexity.cyclomatic}
            </span>
          </div>
        </div>

        <div className="performance-metrics">
          <h4>Performance Metrics</h4>
          <div className="metrics-list">
            {analysis.analysis.performance.map((metric, index) => (
              <div key={index} className="metric-item">
                <div className="metric-info">
                  <span className="metric-name">{metric.metric}</span>
                  <span className="metric-value">
                    {metric.value} {metric.unit}
                  </span>
                </div>
                {metric.recommendation && (
                  <p className="metric-recommendation">{metric.recommendation}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {analysis.analysis.performance.length === 0 && (
          <div className="empty-state">
            <p>No specific performance metrics available for this code.</p>
          </div>
        )}
      </div>
    );
  };

  const renderSecurity = () => {
    if (!analysis) return null;

    return (
      <div className="security-section">
        <div className="section-header">
          <h3>🔒 Security Analysis</h3>
          <span className="issues-count">
            {analysis.analysis.security.length} issues found
          </span>
        </div>

        <div className="security-issues">
          {analysis.analysis.security.map((issue, index) => (
            <div key={index} className={`security-issue ${getSeverityColor(issue.severity)}`}>
              <div className="issue-header">
                <div className="severity-badge">
                  <span className={getSeverityColor(issue.severity)}>
                    {issue.severity.toUpperCase()}
                  </span>
                </div>
                <div className="issue-location">
                  Line {issue.location.line}:{issue.location.column}
                </div>
              </div>
              
              <p className="issue-description">{issue.description}</p>
              
              <div className="issue-fix">
                <h5>Recommended Fix:</h5>
                <p>{issue.fix}</p>
              </div>
              
              <div className="issue-actions">
                <button className="btn-primary">Apply Fix</button>
                <button className="btn-secondary">Learn More</button>
              </div>
            </div>
          ))}
        </div>

        {analysis.analysis.security.length === 0 && (
          <div className="security-good">
            <div className="security-badge">🛡️</div>
            <h4>No Security Issues Found</h4>
            <p>Your code appears to be secure based on common vulnerability patterns.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="code-analyzer-container">
      <div className="analyzer-header">
        <h2>🔬 Code Analyzer</h2>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="code-input-section">
        <div className="input-controls">
          <select 
            value={selectedLanguage} 
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="language-select"
          >
            {languages.map(lang => (
              <option key={lang} value={lang}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </option>
            ))}
          </select>
          
          <button 
            className="btn-primary"
            onClick={analyzeCode}
            disabled={isAnalyzing || !code.trim()}
          >
            {isAnalyzing ? '🔍 Analyzing...' : '🔬 Analyze Code'}
          </button>
        </div>

        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste your code here for comprehensive analysis..."
          className="code-input"
          rows={12}
          spellCheck={false}
        />
      </div>

      {analysis && (
        <>
          <div className="analyzer-tabs">
            <button 
              className={`tab ${activeTab === 'suggestions' ? 'active' : ''}`}
              onClick={() => setActiveTab('suggestions')}
            >
              💡 Suggestions ({analysis.analysis.suggestions.length})
            </button>
            <button 
              className={`tab ${activeTab === 'patterns' ? 'active' : ''}`}
              onClick={() => setActiveTab('patterns')}
            >
              🔍 Patterns ({analysis.analysis.patterns.length})
            </button>
            <button 
              className={`tab ${activeTab === 'performance' ? 'active' : ''}`}
              onClick={() => setActiveTab('performance')}
            >
              ⚡ Performance
            </button>
            <button 
              className={`tab ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              🔒 Security ({analysis.analysis.security.length})
            </button>
          </div>

          <div className="analyzer-content">
            {activeTab === 'suggestions' && renderSuggestions()}
            {activeTab === 'patterns' && renderPatterns()}
            {activeTab === 'performance' && renderPerformance()}
            {activeTab === 'security' && renderSecurity()}
          </div>
        </>
      )}

      {!analysis && !isAnalyzing && (
        <div className="analyzer-empty">
          <div className="empty-icon">🔬</div>
          <h3>Ready to Analyze</h3>
          <p>Paste your code above and click "Analyze Code" to get comprehensive insights including performance optimization, security analysis, and design pattern detection.</p>
        </div>
      )}
    </div>
  );
};

export default CodeAnalyzerComponent;