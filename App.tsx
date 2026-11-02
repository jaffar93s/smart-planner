import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import Learn from './views/Learn';
import SWOTView from './views/SWOTView';
import EisenhowerView from './views/EisenhowerView';
import SMARTView from './views/SMARTView';
import HabitsView from './views/HabitsView';
import { CalendarView } from './views/CalendarView';
import { AnalyticsView } from './views/AnalyticsView';
import PlanningTemplates from './views/PlanningTemplates';
import CoachView from './views/CoachView';
import SettingsView from './views/SettingsView';
import { JournalView } from './views/JournalView';
import { loadJournalEntries, saveJournalEntries } from './services/journalService';
import Onboarding from './components/Onboarding';
import GlobalShare from './components/GlobalShare';
import PDFReportModal from './components/PDFReportModal';
import ReminderModal from './components/ReminderModal';
import ReminderCenter from './components/ReminderCenter';
import ActiveReminderBanner from './components/ActiveReminderBanner';
import QuickActionFAB from './components/QuickActionFAB';
import QuickEntryModal, { QuickEntryTab } from './components/QuickEntryModal';
import { VoiceTaskGoalModal } from './components/VoiceTaskGoalModal';
import { SocialAchievementCardModal, AchievementShareMode } from './components/SocialAchievementCardModal';
import { AuthModal } from './components/AuthModal';
import { subscribeToAuthState } from './services/authService';
import { 
  fetchCloudPlannerState, 
  uploadPlannerStateToCloud, 
  mergeItemsById, 
  subscribeToCloudPlanner,
  CLOUD_SYNC_STORAGE_KEY 
} from './services/cloudSyncService';
import { User } from 'firebase/auth';
import { Share2, Bell, CheckCircle2, ArrowLeft, ArrowRight, X, FileText, Mic, Trophy, Cloud, CloudCheck } from 'lucide-react';
import { 
  PlanningView, 
  SWOTData, 
  EisenhowerTask, 
  SMARTGoal, 
  Habit,
  UserProfile, 
  TimeSlot, 
  ThemeColor, 
  ThemeConfig, 
  NotificationSettings, 
  Locale,
  PlannerReminder,
  ReminderScope
} from './types';
import { TRANSLATIONS } from './constants';
import { 
  INITIAL_DEMO_REMINDERS, 
  playReminderChime, 
  triggerSystemNotification 
} from './services/reminderService';

const THEME_PALETTES: Record<ThemeColor, Record<string, string>> = {
  indigo: { 50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc', 400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81' },
  emerald: { 50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b' },
  rose: { 50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af', 400: '#fb7185', 500: '#f43f5e', 600: '#e11d48', 700: '#be123c', 800: '#9f1239', 900: '#881337' },
  amber: { 50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f' },
  slate: { 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a' },
  violet: { 50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd', 400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9', 800: '#5b21b6', 900: '#4c1d95' },
};

const INITIAL_DEMO_TASKS: EisenhowerTask[] = [
  {
    id: 'demo-task-1',
    text: 'إنهاء العرض التقديمي لخطة الربع السنوي',
    notes: 'تضمين تقرير الإنتاجية والخطط الاستراتيجية',
    category: 'urgent-important',
    customCategory: 'work',
    priority: 'high',
    completed: false,
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    reminderEnabled: true,
    suggestedReminderTime: '09:00'
  },
  {
    id: 'demo-task-2',
    text: 'ممارسة الرياضة الصباحية وقراءة 20 صفحة',
    notes: 'عادة يومية لتجديد الطاقة والتركيز',
    category: 'important-not-urgent',
    customCategory: 'health',
    priority: 'medium',
    completed: false,
    dueDate: new Date().toISOString().split('T')[0],
    reminderEnabled: true,
    suggestedReminderTime: '07:00'
  },
  {
    id: 'demo-task-3',
    text: 'الرد على استفسارات البريد الروتينية',
    notes: 'تحديد وقت ثابت نصف ساعة بعد الظهيرة',
    category: 'urgent-not-important',
    customCategory: 'work',
    priority: 'low',
    completed: false,
    reminderEnabled: false
  },
  {
    id: 'demo-task-4',
    text: 'تقليص وقت تصفح وسائل التواصل العشوائي',
    notes: 'تفعيل مؤقت التركيز الرقمي وتجنب التشتت',
    category: 'not-urgent-not-important',
    customCategory: 'personal',
    priority: 'low',
    completed: false,
    reminderEnabled: false
  }
];

const INITIAL_DEMO_GOALS: SMARTGoal[] = [
  {
    id: 'demo-goal-1',
    title: 'الحصول على شهادة قيادة البيانات المتقدمة',
    specific: 'إكمال الدورة التخصصية واجتياز الامتحان العملي بنسبة 85%+',
    measurable: 'إنهاء 4 وحدات دراسية أسبوعياً وحل كافة الاختبارات التجريبية',
    achievable: 'تخصيص ساعة ونصف يومياً في الصباح الباكر',
    relevant: 'ترقية المسار المهني وزيادة الكفاءة التحليلية',
    timeBound: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
    startDate: new Date().toISOString().split('T')[0],
    targetDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
    progress: 40,
    subTasks: [
      {
        id: 'sub-1-1',
        title: 'مراجعة المنهج الدراسي واختيار المنصة التعليمية المعتمدة',
        estimatedTime: 'يومان',
        completed: true,
        notes: 'تم التسجيل في المنصة وبدء المسار'
      },
      {
        id: 'sub-1-2',
        title: 'إنهاء الوحدات التأسيسية الثلاث الأولى وحل التمارين',
        estimatedTime: 'أسبوعان',
        completed: true,
        notes: 'التركيز على مهارات الاستعلام والنمذجة'
      },
      {
        id: 'sub-1-3',
        title: 'بناء مشروع التخرج العملي وتطبيقه على بيانات واقعية',
        estimatedTime: '3 أسابيع',
        completed: false,
        notes: 'تحضير عرض تقديمي لنتائج التحليل'
      },
      {
        id: 'sub-1-4',
        title: 'خوض الاختبارات التجريبية الثلاثة ومراجعة الأسئلة الصعبة',
        estimatedTime: 'أسبوع واحد',
        completed: false,
        notes: 'الوصول لدرجة 90%+ في الاختبارات التحضيرية'
      },
      {
        id: 'sub-1-5',
        title: 'حجز الموعد النهائي للاختبار المعتمد واجتيازه',
        estimatedTime: 'يوم الاختبار',
        completed: false,
        notes: 'مراجعة الملخصات في اليوم السابق فقط'
      }
    ],
    milestones: [
      {
        id: 'ms-1-1',
        title: 'إنهاء الوحدات التأسيسية واجتياز الاختبار النصفي',
        targetPercent: 25,
        completed: true,
        completedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
        reward: {
          title: 'استراحة قهوة مميزة في مقهى مفضل',
          icon: '☕',
          xpBonus: 50
        }
      },
      {
        id: 'ms-1-2',
        title: 'إنجاز المشروع التطبيقي العملي الأول على بيانات حقيقية',
        targetPercent: 50,
        completed: false,
        reward: {
          title: 'شراء كتاب أو دورة متقدمة ملهمة',
          icon: '📚',
          xpBonus: 100
        }
      },
      {
        id: 'ms-1-3',
        title: 'اجتياز الاختبارات التحضيرية الثلاثة بدرجة تفوق 90%',
        targetPercent: 75,
        completed: false,
        reward: {
          title: 'سهرة سينمائية أو حلقة من مسلسلك المفضل',
          icon: '🎬',
          xpBonus: 75
        }
      },
      {
        id: 'ms-1-4',
        title: 'اجتياز الامتحان النهائي الرسمي ونيل الشهادة المعتمدة',
        targetPercent: 100,
        completed: false,
        reward: {
          title: 'وسام الإنجاز الأكبر وعشاء احتفالي فاخر',
          icon: '🏆',
          xpBonus: 300
        }
      }
    ]
  },
  {
    id: 'demo-goal-2',
    title: 'تحسين اللياقة البدنية والوصول لوزن صحي مثالي',
    specific: 'الجري 5 كم مرتين أسبوعياً والالتزام بنظام غذائي متوازن',
    measurable: 'قياس الوزن ونسبة الدهون كل أسبوعين',
    achievable: 'الاشتراك في نادي رياضي مع صديق للتشجيع',
    relevant: 'رفع مستويات الطاقة والتركيز الذهني طوال اليوم',
    timeBound: new Date(Date.now() + 120 * 86400000).toISOString().split('T')[0],
    startDate: new Date().toISOString().split('T')[0],
    targetDate: new Date(Date.now() + 120 * 86400000).toISOString().split('T')[0],
    progress: 50,
    subTasks: [
      {
        id: 'sub-2-1',
        title: 'إجراء الفحوصات الطبية واستشارة أخصائي تغذية معتمد',
        estimatedTime: '3 أيام',
        completed: true,
        notes: 'تحديد السعرات اليومية المستهدفة'
      },
      {
        id: 'sub-2-2',
        title: 'الاشتراك في النادي وتجهيز الملابس والأحذية الرياضية المناسبة',
        estimatedTime: 'يومان',
        completed: true,
        notes: 'حجز جدول الحصص الصباحية'
      },
      {
        id: 'sub-2-3',
        title: 'الوصول لمسافة 5 كم جري متواصل بدون توقف',
        estimatedTime: '4 أسابيع',
        completed: false,
        notes: 'التدرج من المشي السريع إلى الهرولة'
      },
      {
        id: 'sub-2-4',
        title: 'المحافظة على جدول الوجبات الصحية لمدة 30 يوماً متتالية',
        estimatedTime: 'شهر كامل',
        completed: false,
        notes: 'شرب 3 لترات ماء يومياً'
      }
    ],
    milestones: [
      {
        id: 'ms-2-1',
        title: 'إتمام الفحوصات الطبية وأول أسبوعين من التمارين المستمرة',
        targetPercent: 25,
        completed: true,
        completedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
        reward: {
          title: 'حذاء جري احترافي جديد',
          icon: '👟',
          xpBonus: 60
        }
      },
      {
        id: 'ms-2-2',
        title: 'الجري المتواصل لمسافة 5 كم بدون توقف والوصول لنصف الهدف',
        targetPercent: 50,
        completed: true,
        completedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
        reward: {
          title: 'جلسة تدليك واسترخاء عضلي',
          icon: '💆‍♂️',
          xpBonus: 120
        }
      },
      {
        id: 'ms-2-3',
        title: 'الالتزام الكامل بجدول الوجبات الصحية لمدة 60 يوماً متتالية',
        targetPercent: 75,
        completed: false,
        reward: {
          title: 'جلسة ترفيه وألعاب فيديو حرة',
          icon: '🎮',
          xpBonus: 75
        }
      },
      {
        id: 'ms-2-4',
        title: 'الوصول للوزن الصحي المستهدف وتحقيق اللياقة الذهبية',
        targetPercent: 100,
        completed: false,
        reward: {
          title: 'رحلة عطلة نهاية الأسبوع الاحتفالية',
          icon: '🌟',
          xpBonus: 250
        }
      }
    ]
  }
];

const INITIAL_DEMO_SWOT: SWOTData = {
  strengths: ['إدارة الوقت بمرونة والتزام بالإنتاجية', 'مهارات تحليلية وتنظيمية دقيقة'],
  weaknesses: ['التردد في تفويض المهام الصغيرة أحياناً'],
  opportunities: ['توفر برامج تدريبية متقدمة في الذكاء الاصطناعي', 'فرص مشاريع جديدة ذات عائد نوعي'],
  threats: ['ضغط المواعيد النهائية المتزامنة في فترات الذروة']
};

const getPastDateStr = (daysAgo: number): string => {
  const d = new Date(Date.now() - daysAgo * 86400000);
  return d.toISOString().split('T')[0];
};

const INITIAL_DEMO_HABITS: Habit[] = [
  {
    id: 'demo-habit-1',
    title: 'تمرين لياقة بدنية وجري 30 دقيقة',
    description: 'تحسين اللياقة والنشاط ورفع مستويات الطاقة اليومية',
    category: 'fitness',
    goalId: 'demo-goal-2',
    targetDaysPerWeek: 7,
    color: 'emerald',
    currentStreak: 12,
    bestStreak: 18,
    totalCompletions: 68,
    completedDates: [
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 16, 17, 18, 20, 21, 22, 23, 24, 26, 27, 28,
      30, 31, 32, 33, 35, 36, 38, 39, 40, 42, 44, 45, 46, 48, 49, 50, 52, 53, 55, 56, 57, 59, 60,
      62, 63, 65, 66, 67, 69, 70, 72, 73, 74, 76, 77, 79, 80, 81, 83, 84, 86, 87, 89
    ].map(getPastDateStr),
    reminderTime: '06:30',
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString()
  },
  {
    id: 'demo-habit-2',
    title: 'قراءة 20 صفحة في علوم البيانات والتخطيط',
    description: 'استثمار يومي لتطوير المهارات التخصصية والتحليلية',
    category: 'learning',
    goalId: 'demo-goal-1',
    targetDaysPerWeek: 7,
    color: 'blue',
    currentStreak: 8,
    bestStreak: 15,
    totalCompletions: 62,
    completedDates: [
      0, 1, 2, 3, 4, 5, 6, 7, 9, 11, 12, 14, 16, 17, 18, 19, 21, 22, 24, 25, 28,
      29, 31, 32, 35, 36, 37, 39, 41, 42, 43, 45, 46, 48, 49, 51, 52, 54, 56, 57, 58, 60, 61,
      63, 64, 66, 67, 69, 70, 71, 73, 75, 77, 78, 80, 82, 84, 85, 87, 88
    ].map(getPastDateStr),
    reminderTime: '21:00',
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString()
  },
  {
    id: 'demo-habit-3',
    title: 'شرب 2.5 لتر من الماء بانتظام',
    description: 'الحفاظ على الترطيب الصحي للجسم والتركيز الذهني طوال النهار',
    category: 'health',
    targetDaysPerWeek: 7,
    color: 'cyan',
    currentStreak: 5,
    bestStreak: 10,
    totalCompletions: 58,
    completedDates: [
      0, 1, 2, 3, 4, 6, 7, 8, 9, 11, 13, 14, 15, 17, 18, 20, 22, 23, 26, 27, 28,
      30, 32, 34, 35, 37, 39, 40, 42, 44, 46, 47, 49, 50, 52, 54, 56, 58, 59, 61, 63,
      65, 67, 68, 70, 72, 74, 75, 77, 79, 81, 83, 84, 86, 88, 89
    ].map(getPastDateStr),
    reminderTime: '10:00',
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString()
  },
  {
    id: 'demo-habit-4',
    title: 'جلسة تركيز عميق Deep Work 90 دقيقة',
    description: 'بدون إشعارات أو تشتت لإنجاز المهام الاستراتيجية الصعبة',
    category: 'productivity',
    targetDaysPerWeek: 5,
    color: 'amber',
    currentStreak: 4,
    bestStreak: 7,
    totalCompletions: 48,
    completedDates: [
      1, 2, 3, 4, 6, 7, 9, 11, 13, 14, 15, 18, 20, 22, 25, 27, 28,
      31, 33, 35, 37, 39, 42, 44, 46, 49, 51, 53, 56, 58, 60, 63, 65, 67, 70, 72, 74, 77, 80, 82, 84, 87
    ].map(getPastDateStr),
    reminderTime: '09:00',
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString()
  }
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<PlanningView>('dashboard');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const [locale, setLocale] = useState<Locale>(() => {
    const saved = localStorage.getItem('app-locale');
    return (saved as Locale) || 'ar';
  });
  
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem('app-theme');
    return saved ? JSON.parse(saved) : { primary: 'indigo', mode: 'light' };
  });
  
  const [notifications, setNotifications] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem('app-notifications');
    return saved ? JSON.parse(saved) : { enabled: true, morningDigest: true, leadTimeMinutes: 15, urgentAlertsOnly: false };
  });

  const [swotData, setSwotData] = useState<SWOTData>(() => {
    try {
      const saved = localStorage.getItem('app-swot-data');
      return saved ? JSON.parse(saved) : INITIAL_DEMO_SWOT;
    } catch {
      return INITIAL_DEMO_SWOT;
    }
  });

  const [eisenhowerTasks, setEisenhowerTasks] = useState<EisenhowerTask[]>(() => {
    try {
      const saved = localStorage.getItem('app-eisenhower-tasks');
      return saved ? JSON.parse(saved) : INITIAL_DEMO_TASKS;
    } catch {
      return INITIAL_DEMO_TASKS;
    }
  });

  const [goals, setGoals] = useState<SMARTGoal[]>(() => {
    try {
      const saved = localStorage.getItem('app-smart-goals');
      if (saved) {
        const parsed: SMARTGoal[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(g => {
            if (!g.milestones || g.milestones.length === 0) {
              const demo = INITIAL_DEMO_GOALS.find(dg => dg.id === g.id);
              if (demo && demo.milestones) {
                return { ...g, milestones: demo.milestones };
              }
            }
            return g;
          });
        }
      }
      return INITIAL_DEMO_GOALS;
    } catch {
      return INITIAL_DEMO_GOALS;
    }
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    try {
      const saved = localStorage.getItem('app-habits-data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const totalHistory = parsed.reduce((sum: number, h: Habit) => sum + (h.completedDates?.length || 0), 0);
          if (totalHistory >= 50) {
            return parsed;
          }
        }
      }
      return INITIAL_DEMO_HABITS;
    } catch {
      return INITIAL_DEMO_HABITS;
    }
  });

  const [dailyPlans, setDailyPlans] = useState<Record<string, TimeSlot[]>>({});

  useEffect(() => {
    localStorage.setItem('app-swot-data', JSON.stringify(swotData));
  }, [swotData]);

  useEffect(() => {
    localStorage.setItem('app-eisenhower-tasks', JSON.stringify(eisenhowerTasks));
  }, [eisenhowerTasks]);

  useEffect(() => {
    localStorage.setItem('app-smart-goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('app-habits-data', JSON.stringify(habits));
  }, [habits]);

  // Quick Entry Modal & FAB State
  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState(false);
  const [quickEntryInitialTab, setQuickEntryInitialTab] = useState<QuickEntryTab | undefined>(undefined);
  const [quickToast, setQuickToast] = useState<{ message: string; targetView?: PlanningView } | null>(null);

  const handleOpenQuickEntry = (tab?: QuickEntryTab) => {
    setQuickEntryInitialTab(tab);
    setIsQuickEntryOpen(true);
  };

  const handleCloseQuickEntry = () => {
    setIsQuickEntryOpen(false);
    setQuickEntryInitialTab(undefined);
  };

  const showQuickToast = (message: string, targetView?: PlanningView) => {
    setQuickToast({ message, targetView });
    setTimeout(() => {
      setQuickToast(prev => prev?.message === message ? null : prev);
    }, 4500);
  };

  const handleQuickAddTask = (task: EisenhowerTask, withReminder?: boolean) => {
    setEisenhowerTasks(prev => [task, ...prev]);

    if (withReminder) {
      const todayStr = new Date().toISOString().split('T')[0];
      const targetDate = task.dueDate || todayStr;
      const targetTime = task.suggestedReminderTime || '09:00';
      const targetDateTime = new Date(`${targetDate}T${targetTime}:00`);
      const notifyAt = isNaN(targetDateTime.getTime()) 
        ? new Date(Date.now() + 15 * 60 * 1000).toISOString()
        : new Date(targetDateTime.getTime() - 15 * 60 * 1000).toISOString();

      const newReminder: PlannerReminder = {
        id: Math.random().toString(36).substr(2, 9),
        title: task.text,
        notes: task.notes || (locale === 'ar' ? 'تذكير بمهمة أيزنهاور' : 'Eisenhower task reminder'),
        scope: 'daily',
        taskId: task.id,
        targetDate: targetDate,
        targetTime: targetTime,
        leadTimeMinutes: 15,
        notifyAt: notifyAt,
        priority: task.priority === 'high' ? 'high' : task.priority === 'low' ? 'low' : 'medium',
        status: 'pending',
        soundEnabled: true,
        createdAt: new Date().toISOString()
      };
      setReminders(prev => [newReminder, ...prev]);
    }

    showQuickToast(
      locale === 'ar' ? `تمت إضافة المهمة: "${task.text}"` : `Task added: "${task.text}"`,
      'eisenhower'
    );
  };

  const handleQuickAddGoal = (goal: SMARTGoal) => {
    setGoals(prev => [goal, ...prev]);
    showQuickToast(
      locale === 'ar' ? `تمت إضافة الهدف الذكي: "${goal.title}"` : `SMART goal added: "${goal.title}"`,
      'smart'
    );
  };

  const handleQuickAddSWOTItem = (category: keyof SWOTData, text: string) => {
    setSwotData(prev => ({
      ...prev,
      [category]: [...prev[category], text]
    }));
    const categoryNames: Record<keyof SWOTData, string> = {
      strengths: locale === 'ar' ? 'نقاط القوة' : 'Strengths',
      weaknesses: locale === 'ar' ? 'نقاط الضعف' : 'Weaknesses',
      opportunities: locale === 'ar' ? 'الفرص' : 'Opportunities',
      threats: locale === 'ar' ? 'التهديدات' : 'Threats',
    };
    showQuickToast(
      locale === 'ar' ? `تمت إضافة (${categoryNames[category]}): "${text}"` : `Added (${categoryNames[category]}): "${text}"`,
      'swot'
    );
  };

  // --- Reminders System State ---
  const [reminders, setReminders] = useState<PlannerReminder[]>(() => {
    try {
      const saved = localStorage.getItem('app-reminders');
      return saved ? JSON.parse(saved) : INITIAL_DEMO_REMINDERS;
    } catch {
      return INITIAL_DEMO_REMINDERS;
    }
  });

  const [isReminderCenterOpen, setIsReminderCenterOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderModalData, setReminderModalData] = useState<Partial<PlannerReminder> | null>(null);
  const [isPDFReportOpen, setIsPDFReportOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [voiceModalInitialType, setVoiceModalInitialType] = useState<'task' | 'goal' | 'auto'>('auto');
  const [isSocialShareOpen, setIsSocialShareOpen] = useState(false);
  const [socialShareInitialMode, setSocialShareInitialMode] = useState<AchievementShareMode>('goal');
  const [socialShareSelectedGoal, setSocialShareSelectedGoal] = useState<SMARTGoal | undefined>(undefined);
  const [socialShareSelectedHabit, setSocialShareSelectedHabit] = useState<Habit | undefined>(undefined);

  const handleOpenSocialShare = (mode: AchievementShareMode = 'goal', goal?: SMARTGoal, habit?: Habit) => {
    setSocialShareInitialMode(mode);
    setSocialShareSelectedGoal(goal);
    setSocialShareSelectedHabit(habit);
    setIsSocialShareOpen(true);
  };

  // --- Cloud Authentication & Sync State ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(() => {
    try {
      return localStorage.getItem(CLOUD_SYNC_STORAGE_KEY);
    } catch {
      return null;
    }
  });

  // Listen to Auth State changes & perform initial cloud sync
  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (user) => {
      setCurrentUser(user);
      if (user) {
        setIsSyncing(true);
        try {
          const cloudState = await fetchCloudPlannerState(user.uid);
          if (cloudState) {
            // Merge cloud state into local planner
            if (cloudState.swot) setSwotData(cloudState.swot);
            if (cloudState.goals && cloudState.goals.length > 0) {
              setGoals(prev => mergeItemsById(prev, cloudState.goals));
            }
            if (cloudState.eisenhower && cloudState.eisenhower.length > 0) {
              setEisenhowerTasks(prev => mergeItemsById(prev, cloudState.eisenhower));
            }
            if (cloudState.habits && cloudState.habits.length > 0) {
              setHabits(prev => mergeItemsById(prev, cloudState.habits));
            }
            if (cloudState.dailyPlans) {
              setDailyPlans(prev => ({ ...prev, ...cloudState.dailyPlans }));
            }
            if (cloudState.reminders && cloudState.reminders.length > 0) {
              setReminders(prev => mergeItemsById(prev, cloudState.reminders));
            }
            if (cloudState.journals && cloudState.journals.length > 0) {
              const localJournals = loadJournalEntries();
              const mergedJournals = mergeItemsById(localJournals, cloudState.journals);
              saveJournalEntries(mergedJournals);
            }
            if (cloudState.lastSyncedAt) {
              setLastSyncedAt(cloudState.lastSyncedAt);
            }
          } else {
            // New user account: seed Firestore cloud with local planner state
            const initialPayload = {
              swot: swotData,
              goals,
              eisenhower: eisenhowerTasks,
              habits,
              dailyPlans,
              journals: loadJournalEntries(),
              reminders,
              theme,
              lastSyncedAt: new Date().toISOString()
            };
            const uploadRes = await uploadPlannerStateToCloud(user.uid, initialPayload);
            if (uploadRes.success && uploadRes.syncedAt) {
              setLastSyncedAt(uploadRes.syncedAt);
            }
          }
        } catch (err) {
          console.warn('Initial cloud sync notice:', err);
        } finally {
          setIsSyncing(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Real-time Cloud updates listener from Firestore
  useEffect(() => {
    if (!currentUser) return;
    const unsubCloud = subscribeToCloudPlanner(currentUser.uid, (cloudData) => {
      if (!cloudData) return;
      if (cloudData.lastSyncedAt) {
        setLastSyncedAt(cloudData.lastSyncedAt);
      }
      if (cloudData.swot) setSwotData(cloudData.swot);
      if (cloudData.goals) setGoals(cloudData.goals);
      if (cloudData.eisenhower) setEisenhowerTasks(cloudData.eisenhower);
      if (cloudData.habits) setHabits(cloudData.habits);
      if (cloudData.dailyPlans) setDailyPlans(cloudData.dailyPlans);
      if (cloudData.reminders) setReminders(cloudData.reminders);
      if (cloudData.journals) saveJournalEntries(cloudData.journals);
    });

    return () => unsubCloud();
  }, [currentUser]);

  // Debounced auto-sync to Firestore cloud when local state changes
  useEffect(() => {
    if (!currentUser) return;

    const timer = setTimeout(async () => {
      try {
        const payload = {
          swot: swotData,
          goals,
          eisenhower: eisenhowerTasks,
          habits,
          dailyPlans,
          journals: loadJournalEntries(),
          reminders,
          theme,
          lastSyncedAt: new Date().toISOString()
        };
        const res = await uploadPlannerStateToCloud(currentUser.uid, payload);
        if (res.success && res.syncedAt) {
          setLastSyncedAt(res.syncedAt);
        }
      } catch (e) {
        console.warn('Auto cloud sync notice:', e);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [currentUser, swotData, goals, eisenhowerTasks, habits, dailyPlans, reminders, theme]);

  // Manual Trigger Sync
  const handleManualSync = async () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsSyncing(true);
    try {
      const payload = {
        swot: swotData,
        goals,
        eisenhower: eisenhowerTasks,
        habits,
        dailyPlans,
        journals: loadJournalEntries(),
        reminders,
        theme,
        lastSyncedAt: new Date().toISOString()
      };
      const res = await uploadPlannerStateToCloud(currentUser.uid, payload);
      if (res.success && res.syncedAt) {
        setLastSyncedAt(res.syncedAt);
        showQuickToast(
          locale === 'ar' ? 'تمت مزامنة جميع خططك مع السحابة بنجاح! ☁️' : 'All plans synced to cloud! ☁️'
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    localStorage.setItem('app-reminders', JSON.stringify(reminders));
  }, [reminders]);

  // Real-time Reminder Trigger Loop (runs every 5 seconds)
  useEffect(() => {
    const checkTimer = setInterval(() => {
      const now = Date.now();
      setReminders(prev => {
        let stateChanged = false;
        const nextReminders = prev.map(rem => {
          if (rem.status === 'pending' && new Date(rem.notifyAt).getTime() <= now) {
            stateChanged = true;
            // Trigger audio chime if sound is enabled
            if (notifications.enabled && rem.soundEnabled) {
              playReminderChime();
            }
            // Trigger browser notification if permitted
            triggerSystemNotification(
              rem.title,
              rem.notes || (locale === 'ar' ? 'حان موعد التذكير المحدد في خطتك' : 'Your scheduled planner reminder is due')
            );
            return { ...rem, status: 'triggered' as const };
          }
          return rem;
        });

        return stateChanged ? nextReminders : prev;
      });
    }, 5000);

    return () => clearInterval(checkTimer);
  }, [notifications.enabled, locale]);

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('onboarding-completed');
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => {
    const palette = THEME_PALETTES[theme.primary];
    const root = document.documentElement;
    Object.entries(palette).forEach(([shade, color]) => {
      root.style.setProperty(`--brand-${shade}`, color as string);
    });
    root.classList.toggle('dark', theme.mode === 'dark');
    localStorage.setItem('app-theme', JSON.stringify(theme));
  }, [theme]);

  useEffect(() => {
    const dir = TRANSLATIONS[locale].dir;
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;
    localStorage.setItem('app-locale', locale);
  }, [locale]);

  const toggleLocale = () => {
    setLocale(prev => prev === 'ar' ? 'en' : 'ar');
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboarding-completed', 'true');
    setShowOnboarding(false);
  };

  const handleNavigate = (view: PlanningView) => {
    setCurrentView(view);
    setIsSidebarOpen(false);
  };

  // Reminder Handlers
  const handleOpenReminderModal = (initial?: Partial<PlannerReminder>) => {
    setReminderModalData(initial || null);
    setIsReminderModalOpen(true);
  };

  const handleSaveReminder = (reminder: PlannerReminder) => {
    setReminders(prev => {
      const index = prev.findIndex(r => r.id === reminder.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = reminder;
        return updated;
      }
      return [reminder, ...prev];
    });
  };

  const handleDeleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const handleToggleReminderStatus = (id: string) => {
    setReminders(prev => prev.map(r => {
      if (r.id === id) {
        const nextStatus = r.status === 'completed' ? 'pending' : 'completed';
        return { ...r, status: nextStatus };
      }
      return r;
    }));
  };

  const handleSnoozeReminder = (id: string, minutes: number) => {
    const newNotifyAt = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    setReminders(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: 'pending' as const,
          notifyAt: newNotifyAt,
          snoozedUntil: newNotifyAt
        };
      }
      return r;
    }));
  };

  const handleCompleteTriggeredReminder = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, status: 'completed' as const } : r));
  };

  const handleDismissTriggeredReminder = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, status: 'completed' as const } : r));
  };

  const handleToggleHabitReminder = (habitId: string, enabled: boolean, reminderTime?: string) => {
    const time = reminderTime || '08:00';
    setHabits(prev => prev.map(h => {
      if (h.id === habitId) {
        return {
          ...h,
          reminderEnabled: enabled,
          reminderTime: time
        };
      }
      return h;
    }));

    const targetHabit = habits.find(h => h.id === habitId);
    if (!targetHabit) return;

    if (enabled) {
      const todayStr = new Date().toISOString().split('T')[0];
      const targetDateTime = new Date(`${todayStr}T${time}:00`);
      const notifyAt = isNaN(targetDateTime.getTime()) 
        ? new Date(Date.now() + 60 * 1000).toISOString()
        : targetDateTime.getTime() < Date.now()
          ? new Date(targetDateTime.getTime() + 86400000).toISOString()
          : targetDateTime.toISOString();

      setReminders(prev => {
        const existing = prev.find(r => r.taskId === habitId);
        if (existing) {
          return prev.map(r => r.taskId === habitId ? {
            ...r,
            title: targetHabit.title,
            targetTime: time,
            notifyAt: notifyAt,
            status: 'pending' as const
          } : r);
        } else {
          const newReminder: PlannerReminder = {
            id: `rem-habit-${habitId}`,
            title: targetHabit.title,
            notes: locale === 'ar' ? 'تذكير يومي بالالتزام بهذه العادة' : 'Daily habit consistency reminder',
            scope: 'daily',
            taskId: habitId,
            targetDate: todayStr,
            targetTime: time,
            leadTimeMinutes: 0,
            notifyAt: notifyAt,
            priority: 'medium',
            status: 'pending',
            soundEnabled: true,
            createdAt: new Date().toISOString()
          };
          return [newReminder, ...prev];
        }
      });
    } else {
      setReminders(prev => prev.filter(r => r.taskId !== habitId));
    }
  };

  const userContext: UserProfile = {
    name: locale === 'ar' ? "مستكشف الأهداف" : "Goal Explorer",
    swot: swotData,
    goals: goals,
    eisenhower: eisenhowerTasks,
    habits: habits,
    dailyPlans: dailyPlans,
    reminders: reminders,
    journals: loadJournalEntries(),
    theme: theme,
    notifications: notifications,
    locale: locale
  };

  const pendingRemindersCount = reminders.filter(r => r.status === 'pending' || r.status === 'triggered').length;
  const triggeredReminders = reminders.filter(r => r.status === 'triggered');

  const handleUpdateDailyPlanSlot = (dateKey: string, hour: number, task: string) => {
    const storageKey = `daily_plan_${dateKey}`;
    try {
      const existingStr = localStorage.getItem(storageKey);
      const slots = existingStr ? JSON.parse(existingStr) : {};
      slots[hour] = { task, completed: false };
      localStorage.setItem(storageKey, JSON.stringify(slots));
    } catch (err) {
      console.warn('Failed to update daily plan in localStorage', err);
    }
  };

  const handleToggleTaskCompletion = (taskId: string) => {
    setEisenhowerTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, completed: !t.completed };
      }
      return t;
    }));
  };

  const handleUpdateGoalProgress = (goalId: string, newProgress: number) => {
    setGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        return { ...g, progress: Math.min(100, Math.max(0, newProgress)) };
      }
      return g;
    }));
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return (
        <Dashboard 
          userContext={userContext} 
          onNavigate={setCurrentView} 
          onToggleTaskCompletion={handleToggleTaskCompletion}
          onUpdateGoalProgress={handleUpdateGoalProgress}
          onOpenSocialShare={handleOpenSocialShare}
        />
      );
      case 'analytics': return (
        <AnalyticsView 
          userContext={userContext} 
          onNavigate={setCurrentView} 
          onOpenPDFReport={() => setIsPDFReportOpen(true)}
          onScheduleTask={handleQuickAddTask}
          onAddDailySlot={(date, time, task) => {
            const hour = parseInt(time.split(':')[0], 10) || 9;
            handleUpdateDailyPlanSlot(date, hour, task);
          }}
        />
      );
      case 'calendar': return <CalendarView userContext={userContext} onUpdateDailyPlan={handleUpdateDailyPlanSlot} />;
      case 'learn': return <Learn userContext={userContext} />;
      case 'swot': return (
        <SWOTView 
          data={swotData} 
          setData={setSwotData} 
          userContext={userContext} 
          goals={goals}
          setGoals={setGoals}
        />
      );
      case 'eisenhower': return <EisenhowerView tasks={eisenhowerTasks} setTasks={setEisenhowerTasks} userContext={userContext} onOpenPDFReport={() => setIsPDFReportOpen(true)} />;
      case 'smart': return (
        <SMARTView 
          goals={goals} 
          setGoals={setGoals} 
          userContext={userContext} 
          onAddEisenhowerTask={handleQuickAddTask} 
          onOpenPDFReport={() => setIsPDFReportOpen(true)}
          onOpenSocialShare={(goal) => handleOpenSocialShare('goal', goal)}
        />
      );
      case 'habits': return (
        <HabitsView 
          habits={habits} 
          setHabits={setHabits} 
          userContext={userContext} 
          onNavigateToGoal={() => setCurrentView('smart')}
          onOpenSocialShare={(habit) => handleOpenSocialShare('habit', undefined, habit)}
          onToggleHabitReminder={handleToggleHabitReminder}
        />
      );
      case 'daily':
      case 'weekly':
      case 'monthly':
      case 'yearly':
        return (
          <PlanningTemplates 
            type={currentView} 
            userContext={userContext} 
            reminders={reminders}
            onOpenReminderModal={handleOpenReminderModal}
            onDeleteReminder={handleDeleteReminder}
            onToggleReminderStatus={handleToggleReminderStatus}
          />
        );
      case 'coach': return <CoachView userContext={userContext} />;
      case 'journal': return (
        <JournalView 
          userContext={userContext} 
          onNavigateToView={setCurrentView}
          onAddReminder={handleOpenReminderModal}
          onAddTask={handleQuickAddTask}
        />
      );
      case 'settings': return <SettingsView theme={theme} setTheme={setTheme} notifications={notifications} setNotifications={setNotifications} locale={locale} setLocale={setLocale} userContext={userContext} />;
      default: return <Dashboard userContext={userContext} onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className={`flex h-screen overflow-hidden relative font-sans transition-colors duration-300 ${theme.mode === 'dark' ? 'bg-slate-950 text-slate-100 dark' : 'bg-slate-50 text-slate-900'}`}>
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} locale={locale} />}
      
      {/* Active Triggered Reminder Alerts */}
      <ActiveReminderBanner 
        activeReminders={triggeredReminders}
        onDismiss={handleDismissTriggeredReminder}
        onComplete={handleCompleteTriggeredReminder}
        onSnooze={handleSnoozeReminder}
        locale={locale}
      />

      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar 
        currentView={currentView} 
        onNavigate={handleNavigate} 
        theme={theme.primary} 
        locale={locale} 
        onToggleLocale={toggleLocale}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      <main className="flex-1 min-w-0 flex flex-col h-full overflow-hidden transition-all duration-300">
        {/* Mobile Header Bar */}
        <header className={`lg:hidden flex items-center justify-between p-4 border-b sticky top-0 z-30 transition-colors ${theme.mode === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200'}`}>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -m-2 text-slate-500 hover:text-brand-600 transition-colors"
          >
            <span className="sr-only">Open sidebar</span>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Cloud Sync & Auth Button */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className={`p-2 rounded-xl transition-all relative ${
                currentUser 
                  ? 'text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40' 
                  : 'text-slate-500 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-slate-800'
              }`}
              title={
                currentUser 
                  ? (locale === 'ar' ? `المزامنة السحابية نشطة (${currentUser.email})` : `Cloud Sync Active (${currentUser.email})`)
                  : (locale === 'ar' ? 'تسجيل الدخول والمزامنة السحابية' : 'Sign in & Cloud Sync')
              }
            >
              {currentUser ? (
                <CloudCheck className={`w-5 h-5 text-teal-500 ${isSyncing ? 'animate-spin' : ''}`} />
              ) : (
                <Cloud className="w-5 h-5" />
              )}
              {currentUser && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {/* Voice AI Microphone Assistant Button */}
            <button
              onClick={() => {
                setVoiceModalInitialType(currentView === 'smart' ? 'goal' : currentView === 'eisenhower' ? 'task' : 'auto');
                setIsVoiceModalOpen(true);
              }}
              className="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-xl transition-all relative group"
              title={locale === 'ar' ? "إدخال صوتي بالذكاء الاصطناعي (تحدث لإضافة مهام أو أهداف)" : "Voice AI Input (Speak to add tasks or goals)"}
            >
              <Mic className="w-5 h-5 text-rose-500 animate-pulse" />
            </button>

            {/* PDF Summary Report Button */}
            <button
              onClick={() => setIsPDFReportOpen(true)}
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-xl transition-all"
              title={locale === 'ar' ? "تقرير الأداء PDF" : "PDF Performance Report"}
            >
              <FileText className="w-5 h-5 text-rose-500" />
            </button>

            {/* Reminder Center Button */}
            <button
              onClick={() => setIsReminderCenterOpen(true)}
              className="relative p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
              title={locale === 'ar' ? "مركز التنبيهات والتذكيرات" : "Reminder Center"}
            >
              <Bell className="w-5 h-5" />
              {pendingRemindersCount > 0 && (
                <span className="absolute -top-1 -right-1 rtl:-right-1 rtl:-left-auto ltr:-left-auto ltr:-right-1 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {pendingRemindersCount}
                </span>
              )}
            </button>

            {/* Social Achievement Card Trigger */}
            <button
              onClick={() => handleOpenSocialShare(currentView === 'smart' ? 'goal' : currentView === 'habits' ? 'habit' : 'summary')}
              className="p-2 text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-xl transition-all"
              title={locale === 'ar' ? "مشاركة الإنجاز كصورة للمنصات الاجتماعية 📸" : "Share achievement as social card 📸"}
            >
              <Trophy className="w-5 h-5 text-amber-500" />
            </button>

            <button 
              onClick={() => setIsShareOpen(true)}
              className="p-2 text-slate-400 hover:text-brand-600 transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button 
              onClick={toggleLocale}
              className="text-[10px] font-black text-brand-600 px-3 py-1 bg-brand-50 rounded-full border border-brand-100"
            >
              {locale === 'ar' ? 'EN' : 'AR'}
            </button>
          </div>
        </header>

        {/* Extra bottom padding keeps the last fields scrollable above the floating action buttons */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 pb-32 md:p-8 md:pb-32 lg:p-10 lg:pb-32 xl:p-12 xl:pb-32">
          <div className="max-w-6xl mx-auto">
            {/* Desktop Top Action Bar */}
            <div className="hidden lg:flex items-center justify-end gap-3 mb-6">
              {/* Cloud Sync & Firebase Account Button */}
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className={`flex items-center gap-2 px-3.5 py-2 border rounded-xl text-xs font-black transition-all shadow-sm group ${
                  currentUser 
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100' 
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-slate-800 hover:border-teal-300 hover:text-teal-600'
                }`}
                title={
                  currentUser
                    ? (locale === 'ar' ? `متصل ومزامن سحابياً: ${currentUser.email}` : `Connected & Synced: ${currentUser.email}`)
                    : (locale === 'ar' ? 'تسجيل الدخول والمزامنة السحابية عبر الأجهزة' : 'Sign in & Cloud Sync across devices')
                }
              >
                {currentUser ? (
                  <CloudCheck className={`w-4 h-4 text-emerald-600 dark:text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
                ) : (
                  <Cloud className="w-4 h-4 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform" />
                )}
                <span>
                  {currentUser 
                    ? (locale === 'ar' ? 'المزامنة السحابية ☁️' : 'Cloud Synced ☁️')
                    : (locale === 'ar' ? 'مزامنة سحابية' : 'Cloud Sync')}
                </span>
                {currentUser && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </button>

              {/* Voice AI Dictation Button */}
              <button
                onClick={() => {
                  setVoiceModalInitialType(currentView === 'smart' ? 'goal' : currentView === 'eisenhower' ? 'task' : 'auto');
                  setIsVoiceModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500/10 via-purple-500/10 to-indigo-500/10 border border-rose-200/80 dark:border-rose-800/60 rounded-xl text-xs font-black text-rose-700 dark:text-rose-300 hover:from-rose-500 hover:to-indigo-600 hover:text-white dark:hover:text-white transition-all shadow-sm group"
                title={locale === 'ar' ? "تحدث عبر الميكروفون لإضافة مهام أو أهداف ذكية واستخراجها تلقائياً بالذكاء الاصطناعي" : "Speak to add tasks or SMART goals with AI parsing"}
              >
                <Mic className="w-4 h-4 text-rose-500 group-hover:text-white group-hover:scale-110 transition-transform animate-pulse" />
                <span>{locale === 'ar' ? 'إدخال صوتي ذكي 🎙️' : 'Voice AI (Mic) 🎙️'}</span>
              </button>

              {/* Social Achievement Card Trigger */}
              <button
                onClick={() => handleOpenSocialShare(currentView === 'smart' ? 'goal' : currentView === 'habits' ? 'habit' : 'summary')}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-indigo-500/15 border border-amber-300/80 dark:border-amber-700/60 rounded-xl text-xs font-black text-amber-700 dark:text-amber-300 hover:from-amber-500 hover:to-rose-600 hover:text-white dark:hover:text-white transition-all shadow-sm group"
                title={locale === 'ar' ? "توليد صورة ملخصة للأداء والإنجازات لمشاركتها على وسائل التواصل الاجتماعي" : "Generate social performance summary card for social media"}
              >
                <Trophy className="w-4 h-4 text-amber-500 group-hover:text-white group-hover:scale-110 transition-transform" />
                <span>{locale === 'ar' ? 'مشاركة الإنجاز 📸' : 'Share Card 📸'}</span>
              </button>

              {/* PDF Performance & SMART Goals Report Button */}
              <button
                onClick={() => setIsPDFReportOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-black text-slate-700 dark:text-slate-200 hover:bg-rose-50/70 hover:border-rose-300 hover:text-rose-600 dark:hover:text-rose-400 transition-all shadow-sm group"
                title={locale === 'ar' ? "توليد وتحميل تقرير الأداء وملخص الأهداف كملف PDF" : "Generate & download performance PDF report"}
              >
                <FileText className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
                <span>{locale === 'ar' ? 'تقرير PDF' : 'PDF Report'}</span>
              </button>

              {/* Reminder Center Trigger */}
              <button
                onClick={() => setIsReminderCenterOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-700 hover:bg-amber-50/50 hover:border-amber-300 hover:text-amber-700 transition-all shadow-sm relative group"
              >
                <div className="relative">
                  <Bell className="w-4 h-4 text-amber-500 group-hover:animate-wiggle" />
                  {pendingRemindersCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full min-w-4 text-center leading-tight">
                      {pendingRemindersCount}
                    </span>
                  )}
                </div>
                <span>{locale === 'ar' ? 'مركز التنبيهات' : 'Reminders'}</span>
              </button>

              <button
                onClick={() => setIsShareOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 hover:border-brand-200 hover:text-brand-600 transition-all shadow-sm"
              >
                <Share2 className="w-4 h-4" />
                {TRANSLATIONS[locale].share}
              </button>
            </div>

            <div ref={contentRef}>
              {renderView()}
            </div>
          </div>
        </div>
      </main>

      {/* Global Share Modal */}
      <GlobalShare 
        locale={locale} 
        currentView={currentView} 
        userContext={userContext}
        contentRef={contentRef}
        isOpen={isShareOpen}
        setIsOpen={setIsShareOpen}
        onOpenSocialAchievementCard={() => handleOpenSocialShare('summary')}
      />

      {/* PDF Performance & SMART Goals Summary Report Modal */}
      <PDFReportModal 
        isOpen={isPDFReportOpen}
        onClose={() => setIsPDFReportOpen(false)}
        userContext={userContext}
      />

      {/* Central Reminder Center Slide-over Drawer */}
      <ReminderCenter 
        isOpen={isReminderCenterOpen}
        onClose={() => setIsReminderCenterOpen(false)}
        reminders={reminders}
        onAddReminder={(scope?: ReminderScope) => handleOpenReminderModal({ scope: scope || 'daily' })}
        onEditReminder={(r) => handleOpenReminderModal(r)}
        onDeleteReminder={handleDeleteReminder}
        onToggleStatus={handleToggleReminderStatus}
        onSnooze={handleSnoozeReminder}
        locale={locale}
      />

      {/* Floating Action Button (FAB) detecting current view */}
      <QuickActionFAB 
        currentView={currentView}
        locale={locale}
        onOpenQuickEntry={handleOpenQuickEntry}
        onOpenVoiceModal={() => {
          setVoiceModalInitialType(currentView === 'smart' ? 'goal' : currentView === 'eisenhower' ? 'task' : 'auto');
          setIsVoiceModalOpen(true);
        }}
      />

      {/* Voice AI Task & Goal Creator Modal */}
      <VoiceTaskGoalModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        locale={locale}
        initialType={voiceModalInitialType}
        onAddTask={handleQuickAddTask}
        onAddGoal={handleQuickAddGoal}
      />

      {/* Social Achievement Image Card Generator Modal */}
      <SocialAchievementCardModal
        isOpen={isSocialShareOpen}
        onClose={() => setIsSocialShareOpen(false)}
        userContext={userContext}
        initialMode={socialShareInitialMode}
        initialGoal={socialShareSelectedGoal}
        initialHabit={socialShareSelectedHabit}
      />

      {/* Quick Entry Modal for adding Tasks, Goals, or SWOT items without navigating away */}
      <QuickEntryModal 
        isOpen={isQuickEntryOpen}
        onClose={handleCloseQuickEntry}
        currentView={currentView}
        initialTab={quickEntryInitialTab}
        locale={locale}
        userContext={userContext}
        onAddTask={handleQuickAddTask}
        onAddGoal={handleQuickAddGoal}
        onAddSWOTItem={handleQuickAddSWOTItem}
      />

      {/* Custom Task/Event Reminder Creation & Editing Modal */}
      <ReminderModal 
        isOpen={isReminderModalOpen}
        onClose={() => {
          setIsReminderModalOpen(false);
          setReminderModalData(null);
        }}
        onSave={handleSaveReminder}
        onDelete={handleDeleteReminder}
        initialData={reminderModalData}
        locale={locale}
      />

      {/* Cloud Authentication & Sync Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        locale={locale}
        lastSyncedAt={lastSyncedAt}
        onTriggerManualSync={handleManualSync}
        isSyncing={isSyncing}
      />

      {/* Quick Entry In-Place Feedback Toast */}
      {quickToast && (
        <div className="fixed bottom-24 rtl:left-6 ltr:right-6 md:bottom-28 rtl:md:left-8 ltr:md:right-8 z-50 max-w-sm sm:max-w-md bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700/60 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2.5 min-w-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs font-bold truncate">{quickToast.message}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {quickToast.targetView && currentView !== quickToast.targetView && (
              <button
                onClick={() => {
                  if (quickToast.targetView) handleNavigate(quickToast.targetView);
                  setQuickToast(null);
                }}
                className="text-[11px] font-black text-brand-300 hover:text-white px-2 py-1 rounded-lg bg-brand-500/20 hover:bg-brand-500/30 transition-colors flex items-center gap-1"
              >
                <span>{locale === 'ar' ? 'عرض' : 'View'}</span>
                {locale === 'ar' ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
              </button>
            )}
            <button 
              onClick={() => setQuickToast(null)} 
              className="text-slate-400 hover:text-white p-1 rounded-lg"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;