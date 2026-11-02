export type Locale = 'ar' | 'en';

export type PlanningView = 'dashboard' | 'analytics' | 'calendar' | 'swot' | 'eisenhower' | 'smart' | 'habits' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'coach' | 'learn' | 'settings' | 'journal';

export type ThemeColor = 'indigo' | 'emerald' | 'rose' | 'amber' | 'slate' | 'violet';

export interface ThemeConfig {
  primary: ThemeColor;
  mode: 'light' | 'dark';
}

export interface NotificationSettings {
  enabled: boolean;
  morningDigest: boolean;
  leadTimeMinutes: number;
  urgentAlertsOnly: boolean;
}

export type SWOTCategory = 'work' | 'personal' | 'finance' | 'health' | 'learning' | 'general';

export type SWOTSentiment = 'positive' | 'neutral' | 'concern';

export interface SWOTItemSentimentInfo {
  sentiment: SWOTSentiment;
  reason?: string;
  source?: 'ai' | 'heuristic';
  analyzedAt?: string;
}

export interface SWOTVoiceNote {
  audioData: string; // Base64 data URL
  durationSeconds: number;
  recordedAt: string;
}

export type SWOTColorTag = 'blue' | 'emerald' | 'purple' | 'amber' | 'rose' | 'cyan' | 'slate';

export interface SWOTItemHistoryEntry {
  action: 'created' | 'edited' | 'category_changed' | 'pinned' | 'unpinned' | 'sentiment_changed' | 'voice_note_added' | 'voice_note_deleted' | 'color_changed' | 'completed' | 'uncompleted' | 'notes_updated' | 'goal_linked' | 'goal_unlinked' | 'tags_suggested' | 'tag_removed';
  timestamp: string;
  details?: string;
}

export interface SWOTItemEntry {
  text: string;
  category?: SWOTCategory;
  sentiment?: SWOTSentiment;
  sentimentReason?: string;
  pinned?: boolean;
  colorTag?: SWOTColorTag | string;
  completed?: boolean;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  voiceNote?: SWOTVoiceNote;
  notes?: string;
  linkedGoalIds?: string[];
  tags?: string[]; // Keyword tags suggested on creation (removable)
  suggestedCategory?: SWOTCategory; // Category suggested by auto-tagging, pending user approval
  tagsSource?: 'ai' | 'heuristic';
  history?: SWOTItemHistoryEntry[];
}

export interface SWOTData {
  strengths: (string | SWOTItemEntry)[];
  weaknesses: (string | SWOTItemEntry)[];
  opportunities: (string | SWOTItemEntry)[];
  threats: (string | SWOTItemEntry)[];
}

export type PriorityLevel = 'high' | 'medium' | 'low';

export interface EisenhowerCategory {
  id: string;
  label: string;
  labelEn?: string;
  color: string;
  bg: string;
  border: string;
  accent: string;
  iconName: string;
  isCustom?: boolean;
}

export interface EisenhowerTask {
  id: string;
  text: string;
  notes?: string; 
  category: 'urgent-important' | 'important-not-urgent' | 'urgent-not-important' | 'not-urgent-not-important';
  customCategory?: string; 
  icon?: string; 
  priority: PriorityLevel; 
  completed: boolean;
  delegated?: boolean; 
  dueDate?: string;
  reminderEnabled: boolean;
  suggestedReminderTime?: string;
}

export interface SMARTGoalSubTask {
  id: string;
  title: string;
  completed: boolean;
  estimatedTime?: string;
  dueDate?: string;
  notes?: string;
}

export interface SMARTGoalMilestoneReward {
  title: string;
  icon: string; // Emoji e.g. ☕, 🎮, 🎬, 🏆, 🌟, 🍕, 📚
  xpBonus: number; // e.g. 50, 100
}

export interface SMARTGoalMilestone {
  id: string;
  title: string;
  targetPercent: number; // Target progress e.g. 25, 50, 75, 100
  completed: boolean;
  completedAt?: string;
  reward: SMARTGoalMilestoneReward;
  notes?: string;
}

export interface SMARTGoal {
  id: string;
  title: string;
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  timeBound: string;
  startDate: string;
  targetDate: string;
  progress: number;
  subTasks?: SMARTGoalSubTask[];
  milestones?: SMARTGoalMilestone[];
}

export type HabitCategory = 'health' | 'learning' | 'productivity' | 'mindfulness' | 'fitness' | 'personal';

export interface Habit {
  id: string;
  title: string;
  description?: string;
  category: HabitCategory;
  goalId?: string; // Linked SMART Goal ID
  targetDaysPerWeek: number; // e.g. 7 or 5
  color: string; // color accent key
  icon?: string;
  currentStreak: number;
  bestStreak: number;
  totalCompletions: number;
  completedDates: string[]; // List of YYYY-MM-DD
  reminderTime?: string; // HH:mm
  reminderEnabled?: boolean; // Toggle for daily habit notifications
  createdAt: string;
}

export interface TimeSlot {
  time: string;
  task: string;
  completed: boolean;
}

export interface DayPlan {
  date: string;
  slots: TimeSlot[];
}

export interface YearlyGoal {
  id: string;
  title: string;
  targetDate: string;
  startDate: string;
  progress: number;
  description: string;
}

export type ReminderScope = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type ReminderPriority = 'high' | 'medium' | 'low';
export type ReminderStatus = 'pending' | 'triggered' | 'completed' | 'snoozed';

export interface PlannerReminder {
  id: string;
  title: string;
  notes?: string;
  scope: ReminderScope;
  taskId?: string; // Identifier for associated slot or goal
  targetDate: string; // YYYY-MM-DD
  targetTime?: string; // HH:mm
  leadTimeMinutes: number; // 0, 5, 10, 15, 30, 60, 120, 1440, 2880, 10080, -1
  customReminderDateTime?: string; // ISO string if custom
  notifyAt: string; // Calculated ISO timestamp when alert triggers
  priority: ReminderPriority;
  status: ReminderStatus;
  snoozedUntil?: string;
  soundEnabled: boolean;
  createdAt: string;
}

export type JournalMood = 'great' | 'good' | 'neutral' | 'stressed' | 'exhausted';

export interface JournalAIAnalysis {
  sentiment: 'positive' | 'balanced' | 'overworked' | 'stressed' | 'neutral';
  workLifeBalanceScore: number; // 0 - 100
  balanceStatus: string; // e.g. 'متوازن ممتاز' / 'إجهاد عمل طفيف' / 'تحذير احتراق'
  summary: string;
  keyStressors: string[];
  positiveHighlights: string[];
  actionableTips: string[];
  recommendedHabitsOrBreaks: string[];
  encouragementQuote: string;
  analyzedAt: string;
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  title?: string;
  content: string;
  mood?: JournalMood;
  energyLevel?: number; // 1 - 5
  tags?: string[];
  aiAnalysis?: JournalAIAnalysis;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  name: string;
  swot: SWOTData;
  goals: SMARTGoal[];
  eisenhower: EisenhowerTask[];
  habits: Habit[];
  dailyPlans: Record<string, TimeSlot[]>;
  reminders: PlannerReminder[];
  journals?: JournalEntry[];
  theme: ThemeConfig;
  notifications: NotificationSettings;
  locale: Locale;
}

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  htmlLink?: string;
  status?: string;
  colorId?: string;
}

export interface GoogleCalendarUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}