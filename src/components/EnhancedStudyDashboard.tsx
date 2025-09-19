import React, { useState, useEffect } from 'react';
import { StudyDashboard, DailyStats, LearningRecommendation, StudyGoal, ReviewItem } from '../types/index';

interface StudyDashboardProps {
  onClose: () => void;
}

export const EnhancedStudyDashboard: React.FC<StudyDashboardProps> = ({ onClose }) => {
  const [dashboard, setDashboard] = useState<StudyDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'goals' | 'recommendations' | 'analytics'>('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await chrome.runtime.sendMessage({ action: 'getStudyDashboard' });
      if (response && response.success) {
        setDashboard(response.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getStreakEmoji = (streak: number): string => {
    if (streak >= 30) return '🔥';
    if (streak >= 14) return '⚡';
    if (streak >= 7) return '✨';
    if (streak >= 3) return '💪';
    return '🌱';
  };

  const renderOverview = () => {
    if (!dashboard) return null;

    return (
      <div className="dashboard-overview">
        <div className="stats-grid">
          <div className="stat-card streak-card">
            <div className="stat-icon">{getStreakEmoji(dashboard.learningStreak)}</div>
            <div className="stat-content">
              <h3>{dashboard.learningStreak}</h3>
              <p>Day Streak</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-content">
              <h3>{formatTime(dashboard.todayStats.timeSpent)}</h3>
              <p>Today</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🧩</div>
            <div className="stat-content">
              <h3>{dashboard.todayStats.problemsSolved}</h3>
              <p>Problems Solved</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🎥</div>
            <div className="stat-content">
              <h3>{dashboard.todayStats.videosWatched}</h3>
              <p>Videos Watched</p>
            </div>
          </div>
        </div>

        <div className="section-grid">
          <div className="section upcoming-reviews">
            <h3>📅 Upcoming Reviews</h3>
            <div className="review-list">
              {dashboard.upcomingReviews.slice(0, 5).map(review => (
                <div key={review.id} className={`review-item priority-${review.priority}`}>
                  <div className="review-info">
                    <span className="review-title">{review.title}</span>
                    <span className="review-type">{review.type}</span>
                  </div>
                  <div className="review-meta">
                    <span className={`difficulty-${review.difficulty}`}>{review.difficulty}</span>
                    <span className="due-date">
                      {new Date(review.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="section weekly-progress">
            <h3>📊 Weekly Progress</h3>
            <div className="progress-chart">
              {dashboard.weeklyProgress.days.map((day, index) => (
                <div key={index} className="day-bar">
                  <div 
                    className="bar-fill" 
                    style={{ height: `${Math.min(day.timeSpent / 120 * 100, 100)}%` }}
                  />
                  <span className="day-label">{['S', 'M', 'T', 'W', 'T', 'F', 'S'][index]}</span>
                </div>
              ))}
            </div>
            <div className="progress-stats">
              <span>Total: {formatTime(dashboard.weeklyProgress.totalTime)}</span>
              <span>Avg: {formatTime(dashboard.weeklyProgress.averageTime)}</span>
              <span>Rate: {dashboard.weeklyProgress.completionRate}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGoals = () => {
    if (!dashboard) return null;

    return (
      <div className="goals-section">
        <div className="goals-header">
          <h3>🎯 Study Goals</h3>
          <button className="btn-secondary" onClick={() => {}}>Add Goal</button>
        </div>
        <div className="goals-list">
          {dashboard.studyGoals.map(goal => (
            <div key={goal.id} className={`goal-card status-${goal.status}`}>
              <div className="goal-header">
                <h4>{goal.title}</h4>
                <span className={`priority-badge priority-${goal.priority}`}>
                  {goal.priority}
                </span>
              </div>
              <p className="goal-description">{goal.description}</p>
              <div className="goal-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${Math.min(goal.current / goal.target * 100, 100)}%` }}
                  />
                </div>
                <span className="progress-text">
                  {goal.current} / {goal.target} {goal.type}
                </span>
              </div>
              <div className="goal-meta">
                <span className="deadline">
                  Due: {new Date(goal.deadline).toLocaleDateString()}
                </span>
                <span className={`status-${goal.status}`}>{goal.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderRecommendations = () => {
    if (!dashboard) return null;

    return (
      <div className="recommendations-section">
        <h3>💡 AI Recommendations</h3>
        <div className="recommendations-list">
          {dashboard.recommendations.map(rec => (
            <div key={rec.id} className={`recommendation-card type-${rec.type}`}>
              <div className="rec-header">
                <h4>{rec.title}</h4>
                <div className="rec-meta">
                  <span className={`difficulty-${rec.difficulty}`}>{rec.difficulty}</span>
                  <span className="time-estimate">{formatTime(rec.estimatedTime)}</span>
                  <span className="confidence">
                    {Math.round(rec.confidence * 100)}% match
                  </span>
                </div>
              </div>
              <p className="rec-description">{rec.description}</p>
              <p className="rec-reason"><strong>Why:</strong> {rec.reason}</p>
              <div className="rec-actions">
                <button className="btn-primary">Start Learning</button>
                <button className="btn-secondary">Save for Later</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAnalytics = () => {
    if (!dashboard) return null;

    return (
      <div className="analytics-section">
        <h3>📈 Learning Analytics</h3>
        <div className="analytics-grid">
          <div className="analytics-card">
            <h4>Study Patterns</h4>
            <div className="pattern-analysis">
              <div className="pattern-item">
                <span>Peak Hours:</span>
                <span>9 AM - 11 AM</span>
              </div>
              <div className="pattern-item">
                <span>Best Day:</span>
                <span>Tuesday</span>
              </div>
              <div className="pattern-item">
                <span>Focus Time:</span>
                <span>45 minutes avg</span>
              </div>
            </div>
          </div>

          <div className="analytics-card">
            <h4>Skill Development</h4>
            <div className="skill-progress">
              <div className="skill-item">
                <span>Algorithms</span>
                <div className="skill-bar">
                  <div className="skill-fill" style={{ width: '75%' }} />
                </div>
                <span>75%</span>
              </div>
              <div className="skill-item">
                <span>Data Structures</span>
                <div className="skill-bar">
                  <div className="skill-fill" style={{ width: '60%' }} />
                </div>
                <span>60%</span>
              </div>
              <div className="skill-item">
                <span>System Design</span>
                <div className="skill-bar">
                  <div className="skill-fill" style={{ width: '40%' }} />
                </div>
                <span>40%</span>
              </div>
            </div>
          </div>

          <div className="analytics-card">
            <h4>Performance Metrics</h4>
            <div className="metrics-list">
              <div className="metric-item">
                <span>Problem Accuracy:</span>
                <span className="metric-good">78%</span>
              </div>
              <div className="metric-item">
                <span>First Attempt Success:</span>
                <span className="metric-average">45%</span>
              </div>
              <div className="metric-item">
                <span>Learning Retention:</span>
                <span className="metric-good">82%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2>📊 Study Dashboard</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading your learning data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>📊 Study Dashboard</h2>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'goals' ? 'active' : ''}`}
          onClick={() => setActiveTab('goals')}
        >
          Goals
        </button>
        <button 
          className={`tab ${activeTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          AI Recommendations
        </button>
        <button 
          className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'goals' && renderGoals()}
        {activeTab === 'recommendations' && renderRecommendations()}
        {activeTab === 'analytics' && renderAnalytics()}
      </div>
    </div>
  );
};

export default EnhancedStudyDashboard;