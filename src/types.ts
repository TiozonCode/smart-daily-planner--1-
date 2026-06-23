export interface User {
  id: string;
  email: string;
  name: string;
  productivityScore: number;
  joinedAt: string;
}

export type TaskPriority = 'high' | 'medium' | 'low';

export interface SubStep {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  priority: TaskPriority;
  dueDate: string;
  estimatedEffort: number; // in minutes
  completed: boolean;
  completedAt?: string;
  subSteps?: SubStep[];
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  category: string;
  streak: number;
  lastCheckedIn?: string; // YYYY-MM-DD
  history: string[]; // array of YYYY-MM-DD dates
  createdAt: string;
  isArchived?: boolean;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  date: string; // YYYY-MM-DD
  target: number;
  current: number;
  unit: string;
  category: string;
  completed: boolean;
}

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  time: string; // HH:MM
  repeat: 'daily' | 'weekly' | 'none';
  active: boolean;
  lastTriggered?: string; // ISO string or date
  category: string;
}

export interface ReminderLog {
  id: string;
  userId: string;
  reminderId: string;
  title: string;
  time: string;
  triggeredAt: string;
}

export interface AIRecommendation {
  recommendedOrder: string[];
  explanation: string;
  suggestedSchedule: Array<{ time: string; taskTitle: string; reason: string }>;
  warnings: string[];
  generatedAt: string;
}

export interface DashboardStats {
  score: number;
  tasksCompletedToday: number;
  totalTasksToday: number;
  activeHabitStreaks: number;
  goalsCompletionPercentage: number;
  upcomingDeadlinesCount: number;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  mood: 'happy_cat' | 'playful_cat' | 'sleepy_cat' | 'sassy_cat' | 'grumpy_cat' | 'sparklestars';
  emoji: string;
  stickers: string[];
  date: string; // YYYY-MM-DD
  createdAt: string;
  isLocked?: boolean;
  passcode?: string;
}

export interface BudgetTransaction {
  id: string;
  userId: string;
  title: string;
  amount: number; // positive for allowance/saving, negative for spent
  type: 'allowance' | 'cat_treat' | 'cat_toy' | 'learning_craft' | 'game_other';
  notes: string;
  date: string; // YYYY-MM-DD
  createdAt: string;
}

