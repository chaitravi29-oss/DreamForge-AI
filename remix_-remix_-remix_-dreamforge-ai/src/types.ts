export interface Task {
  id: string;
  text: string;
  isCompleted: boolean;
  timeframe: "daily" | "weekly" | "monthly";
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetWeek: number;
  isCompleted: boolean;
  tasks: Task[];
}

export interface Skill {
  name: string;
  description: string;
}

export interface Roadmap {
  goalName: string;
  category: string;
  description: string;
  difficulty: string;
  estimatedTime: string;
  skillsToAcquire: Skill[];
  milestones: Milestone[];
  mentorName: string;
  mentorPersonality: string;
  initialRecommendations: string[];
}

export interface ChatMessage {
  id: string;
  sender: "user" | "mentor";
  text: string;
  timestamp: string;
}

export interface UserStats {
  achievementScore: number;
  totalTasksCount: number;
  completedTasksCount: number;
  totalMilestonesCount: number;
  completedMilestonesCount: number;
  streakDays: number;
  lastActiveDate?: string;
}

export interface AIResource {
  id: string;
  type: "video" | "course" | "book" | "article" | "website";
  title: string;
  url: string;
  description: string;
  durationOrLength: string;
  creatorOrPlatform: string;
  isBookmarked: boolean;
  isCompleted: boolean;
}

