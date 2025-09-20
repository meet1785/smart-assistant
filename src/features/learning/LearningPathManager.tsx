import React, { useState, useEffect } from 'react';
import { Button, Card, CardHeader, CardContent, Progress, Badge, Input, Modal, Alert } from '../../components/ui';
import { FloatingPanel } from '../../components/layout';

export interface LearningGoal {
  id: string;
  title: string;
  description: string;
  category: 'coding' | 'algorithms' | 'system-design' | 'interview-prep' | 'general';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours: number;
  completedHours: number;
  dueDate?: Date;
  isCompleted: boolean;
  milestones: LearningMilestone[];
  resources: LearningResource[];
}

export interface LearningMilestone {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  completedAt?: Date;
  requiredSkills: string[];
}

export interface LearningResource {
  id: string;
  type: 'video' | 'article' | 'problem' | 'project' | 'course';
  title: string;
  url: string;
  estimatedTime: number; // in minutes
  isCompleted: boolean;
  platform?: 'leetcode' | 'youtube' | 'github' | 'coursera' | 'other';
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedWeeks: number;
  goals: string[]; // goal IDs
  isActive: boolean;
  progress: number; // 0-100
  createdAt: Date;
  lastUpdated: Date;
}

export interface LearningPathManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LearningPathManager: React.FC<LearningPathManagerProps> = ({
  isOpen,
  onClose
}) => {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [goals, setGoals] = useState<LearningGoal[]>([]);
  const [activeTab, setActiveTab] = useState<'paths' | 'goals' | 'progress'>('paths');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [newPath, setNewPath] = useState({
    name: '',
    description: '',
    category: '',
    difficulty: 'beginner' as const
  });
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'coding' as const,
    difficulty: 'beginner' as const,
    estimatedHours: 10
  });

  // Mock data for demonstration
  useEffect(() => {
    const mockPaths: LearningPath[] = [
      {
        id: '1',
        name: 'Frontend Development Mastery',
        description: 'Complete path to become a skilled frontend developer',
        category: 'Web Development',
        difficulty: 'intermediate',
        estimatedWeeks: 12,
        goals: ['1', '2'],
        isActive: true,
        progress: 65,
        createdAt: new Date('2024-01-01'),
        lastUpdated: new Date()
      },
      {
        id: '2',
        name: 'Algorithm Interview Prep',
        description: 'Comprehensive preparation for coding interviews',
        category: 'Interview Preparation',
        difficulty: 'advanced',
        estimatedWeeks: 8,
        goals: ['3'],
        isActive: false,
        progress: 30,
        createdAt: new Date('2024-02-01'),
        lastUpdated: new Date()
      }
    ];

    const mockGoals: LearningGoal[] = [
      {
        id: '1',
        title: 'Master React Hooks',
        description: 'Learn and practice all React hooks with real projects',
        category: 'coding',
        difficulty: 'intermediate',
        estimatedHours: 25,
        completedHours: 16,
        isCompleted: false,
        milestones: [
          {
            id: '1',
            title: 'Learn useState and useEffect',
            description: 'Master the basic hooks',
            isCompleted: true,
            completedAt: new Date('2024-01-15'),
            requiredSkills: ['JavaScript', 'React Basics']
          },
          {
            id: '2',
            title: 'Custom Hooks Creation',
            description: 'Build reusable custom hooks',
            isCompleted: false,
            requiredSkills: ['React Hooks', 'JavaScript']
          }
        ],
        resources: [
          {
            id: '1',
            type: 'video',
            title: 'React Hooks Tutorial',
            url: 'https://youtube.com/watch?v=example',
            estimatedTime: 60,
            isCompleted: true,
            platform: 'youtube'
          }
        ]
      },
      {
        id: '2',
        title: 'Build 5 Projects',
        description: 'Complete 5 real-world React projects',
        category: 'coding',
        difficulty: 'intermediate',
        estimatedHours: 40,
        completedHours: 8,
        isCompleted: false,
        milestones: [],
        resources: []
      },
      {
        id: '3',
        title: 'Solve 150 LeetCode Problems',
        description: 'Master data structures and algorithms',
        category: 'algorithms',
        difficulty: 'advanced',
        estimatedHours: 100,
        completedHours: 30,
        isCompleted: false,
        milestones: [],
        resources: []
      }
    ];

    setPaths(mockPaths);
    setGoals(mockGoals);
  }, []);

  const createLearningPath = () => {
    const path: LearningPath = {
      id: Date.now().toString(),
      name: newPath.name,
      description: newPath.description,
      category: newPath.category,
      difficulty: newPath.difficulty,
      estimatedWeeks: 8,
      goals: [],
      isActive: false,
      progress: 0,
      createdAt: new Date(),
      lastUpdated: new Date()
    };

    setPaths(prev => [...prev, path]);
    setNewPath({ name: '', description: '', category: '', difficulty: 'beginner' });
    setShowCreateModal(false);
  };

  const createGoal = () => {
    const goal: LearningGoal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      category: newGoal.category,
      difficulty: newGoal.difficulty,
      estimatedHours: newGoal.estimatedHours,
      completedHours: 0,
      isCompleted: false,
      milestones: [],
      resources: []
    };

    setGoals(prev => [...prev, goal]);
    setNewGoal({
      title: '',
      description: '',
      category: 'coding',
      difficulty: 'beginner',
      estimatedHours: 10
    });
    setShowGoalModal(false);
  };

  const togglePathActive = (pathId: string) => {
    setPaths(prev => prev.map(path => 
      path.id === pathId 
        ? { ...path, isActive: !path.isActive, lastUpdated: new Date() }
        : path
    ));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'danger';
      default: return 'default';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'coding': return '💻';
      case 'algorithms': return '🧮';
      case 'system-design': return '🏗️';
      case 'interview-prep': return '🎤';
      default: return '📚';
    }
  };

  if (!isOpen) return null;

  return (
    <FloatingPanel
      isOpen={isOpen}
      onClose={onClose}
      title="Learning Path Manager"
      defaultSize={{ width: 900, height: 700 }}
    >
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-6">
          {(['paths', 'goals', 'progress'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Learning Paths Tab */}
      {activeTab === 'paths' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Learning Paths</h2>
            <Button onClick={() => setShowCreateModal(true)}>
              Create New Path
            </Button>
          </div>

          <div className="grid gap-4">
            {paths.map((path) => (
              <Card key={path.id} variant="outlined" className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{path.name}</h3>
                      <p className="text-gray-600 text-sm mt-1">{path.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getDifficultyColor(path.difficulty)}>
                        {path.difficulty}
                      </Badge>
                      <Badge variant={path.isActive ? 'success' : 'default'}>
                        {path.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Category: {path.category}</span>
                      <span>Est. {path.estimatedWeeks} weeks</span>
                    </div>
                    <Progress 
                      value={path.progress} 
                      showLabel 
                      label="Progress"
                      variant={path.progress > 80 ? 'success' : path.progress > 50 ? 'default' : 'warning'}
                    />
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-sm text-gray-500">
                        Last updated: {path.lastUpdated.toLocaleDateString()}
                      </span>
                      <div className="space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => togglePathActive(path.id)}
                        >
                          {path.isActive ? 'Pause' : 'Activate'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPath(path)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Learning Goals Tab */}
      {activeTab === 'goals' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Learning Goals</h2>
            <Button onClick={() => setShowGoalModal(true)}>
              Create New Goal
            </Button>
          </div>

          <div className="grid gap-4">
            {goals.map((goal) => (
              <Card key={goal.id} variant="outlined" className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{getCategoryIcon(goal.category)}</span>
                      <div>
                        <h3 className="text-lg font-semibold">{goal.title}</h3>
                        <p className="text-gray-600 text-sm mt-1">{goal.description}</p>
                      </div>
                    </div>
                    <Badge variant={getDifficultyColor(goal.difficulty)}>
                      {goal.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Progress 
                      value={goal.completedHours} 
                      max={goal.estimatedHours}
                      showLabel 
                      label={`${goal.completedHours}/${goal.estimatedHours} hours`}
                      variant={goal.isCompleted ? 'success' : 'default'}
                    />
                    
                    {goal.milestones.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Milestones:</h4>
                        <div className="space-y-1">
                          {goal.milestones.map((milestone) => (
                            <div key={milestone.id} className="flex items-center space-x-2 text-sm">
                              <span className={milestone.isCompleted ? '✅' : '⭕'}>
                                {milestone.isCompleted ? '✅' : '⭕'}
                              </span>
                              <span className={milestone.isCompleted ? 'line-through text-gray-500' : ''}>
                                {milestone.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {goal.resources.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Resources:</h4>
                        <div className="text-sm text-gray-600">
                          {goal.resources.length} resources • {goal.resources.filter(r => r.isCompleted).length} completed
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Progress Tab */}
      {activeTab === 'progress' && (
        <div>
          <h2 className="text-xl font-semibold mb-6">Learning Progress</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader title="Overall Statistics" />
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Active Paths:</span>
                    <span className="font-medium">{paths.filter(p => p.isActive).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Goals:</span>
                    <span className="font-medium">{goals.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed Goals:</span>
                    <span className="font-medium">{goals.filter(g => g.isCompleted).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Study Hours:</span>
                    <span className="font-medium">{goals.reduce((sum, g) => sum + g.completedHours, 0)}h</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="Recent Activity" />
              <CardContent>
                <div className="space-y-3">
                  <Alert variant="success" title="Milestone Completed!">
                    Completed "Learn useState and useEffect" in React Hooks mastery
                  </Alert>
                  <div className="text-sm text-gray-600">
                    <p>🎯 Updated learning goal progress</p>
                    <p>📚 Added new resource to collection</p>
                    <p>⏰ Spent 2 hours on Algorithm practice</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Create Path Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Learning Path"
      >
        <div className="space-y-4">
          <Input
            label="Path Name"
            value={newPath.name}
            onChange={(e) => setNewPath(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Full Stack Development"
          />
          <Input
            label="Description"
            value={newPath.description}
            onChange={(e) => setNewPath(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Brief description of the learning path"
          />
          <Input
            label="Category"
            value={newPath.category}
            onChange={(e) => setNewPath(prev => ({ ...prev, category: e.target.value }))}
            placeholder="e.g., Web Development, Data Science"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty
            </label>
            <select
              value={newPath.difficulty}
              onChange={(e) => setNewPath(prev => ({ ...prev, difficulty: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={createLearningPath} disabled={!newPath.name}>
              Create Path
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Goal Modal */}
      <Modal
        isOpen={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        title="Create Learning Goal"
      >
        <div className="space-y-4">
          <Input
            label="Goal Title"
            value={newGoal.title}
            onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g., Master React Hooks"
          />
          <Input
            label="Description"
            value={newGoal.description}
            onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Detailed description of what you want to achieve"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={newGoal.category}
              onChange={(e) => setNewGoal(prev => ({ ...prev, category: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="coding">Coding</option>
              <option value="algorithms">Algorithms</option>
              <option value="system-design">System Design</option>
              <option value="interview-prep">Interview Prep</option>
              <option value="general">General</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty
            </label>
            <select
              value={newGoal.difficulty}
              onChange={(e) => setNewGoal(prev => ({ ...prev, difficulty: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <Input
            label="Estimated Hours"
            type="number"
            value={newGoal.estimatedHours}
            onChange={(e) => setNewGoal(prev => ({ ...prev, estimatedHours: parseInt(e.target.value) || 10 }))}
            min={1}
            max={1000}
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setShowGoalModal(false)}>
              Cancel
            </Button>
            <Button onClick={createGoal} disabled={!newGoal.title}>
              Create Goal
            </Button>
          </div>
        </div>
      </Modal>
    </FloatingPanel>
  );
};

export default LearningPathManager;