import React from 'react';
import { Target, Shield, Zap, TrendingUp, AlertTriangle } from 'lucide-react';
import { Locale } from './types';

export const TRANSLATIONS = {
  ar: {
    app_name: "مخططي الذكي",
    generation: "الجيل الثالث",
    dashboard: "لوحة التحكم",
    analytics: "تحليلات الإنتاجية",
    calendar: "التقويم (Google)",
    learn: "مركز المعرفة",
    swot: "تحليل SWOT",
    eisenhower: "الأولويات",
    smart: "الأهداف الذكية",
    habits: "العادات اليومية",
    daily: "تخطيط يومي",
    weekly: "تخطيط أسبوعي",
    monthly: "تخطيط شهري",
    yearly: "تخطيط سنوي",
    coach: "المدرب الذكي",
    journal: "المذكرات اليومية",
    settings: "الإعدادات",
    welcome: "مرحباً بك",
    new_plan: "خطة جديدة اليوم",
    focus_hours: "ساعات التركيز",
    today_challenges: "تحديات اليوم",
    strat_goals: "الأهداف الإستراتيجية",
    focus_mode: "وضع التركيز",
    focus_desc: "ضاعف إنتاجيتك الآن",
    share: "مشاركة",
    export_pdf: "حفظ بصيغة PDF",
    share_options: "خيارات المشاركة",
    current_view: "الواجهة الحالية فقط",
    all_data: "البيانات الكاملة",
    share_with: "مشاركة مع...",
    lang_switch: "English",
    dir: "rtl"
  },
  en: {
    app_name: "Smart Planner",
    generation: "V3.0",
    dashboard: "Dashboard",
    analytics: "Productivity Analytics",
    calendar: "Calendar (Google)",
    learn: "Knowledge Base",
    swot: "SWOT Analysis",
    eisenhower: "Priorities",
    smart: "SMART Goals",
    habits: "Habits & Streaks",
    daily: "Daily Plan",
    weekly: "Weekly Plan",
    monthly: "Monthly Plan",
    yearly: "Yearly Plan",
    coach: "AI Coach",
    journal: "Daily Journal",
    settings: "Settings",
    welcome: "Welcome",
    new_plan: "New Plan Today",
    focus_hours: "Focus Hours",
    today_challenges: "Today's Tasks",
    strat_goals: "Strategic Goals",
    focus_mode: "Focus Mode",
    focus_desc: "Double your productivity",
    share: "Share",
    export_pdf: "Save as PDF",
    share_options: "Share Options",
    current_view: "Current View Only",
    all_data: "Full Data",
    share_with: "Share with...",
    lang_switch: "العربية",
    dir: "ltr"
  }
};

export const EDUCATIONAL_CONTENT = {
  swot: {
    title: { ar: "تحليل SWOT", en: "SWOT Analysis" },
    description: { 
      ar: "أداة تخطيط استراتيجي تُستخدم لمساعدة الأشخاص على تحديد نقاط القوة والضعف والفرص والتهديدات.",
      en: "A strategic planning tool used to help individuals identify Strengths, Weaknesses, Opportunities, and Threats."
    },
    videoId: "_8_vW-7-eJc",
    sections: [
      { id: 'S', title: { ar: 'نقاط القوة (Strengths)', en: 'Strengths' }, color: 'text-green-600', icon: <Zap className="w-5 h-5"/> },
      { id: 'W', title: { ar: 'نقاط الضعف (Weaknesses)', en: 'Weaknesses' }, color: 'text-red-600', icon: <Shield className="w-5 h-5"/> },
      { id: 'O', title: { ar: 'الفرص (Opportunities)', en: 'Opportunities' }, color: 'text-amber-600', icon: <TrendingUp className="w-5 h-5"/> },
      { id: 'T', title: { ar: 'التهديدات (Threats)', en: 'Threats' }, color: 'text-blue-600', icon: <AlertTriangle className="w-5 h-5"/> }
    ]
  },
  eisenhower: {
    title: { ar: "مصفوفة أيزنهاور", en: "Eisenhower Matrix" },
    description: {
      ar: "طريقة لتنظيم المهام حسب الأهمية والاستعجال، مما يساعدك على تحديد أولوياتك بدقة.",
      en: "A way to organize tasks by importance and urgency, helping you prioritize accurately."
    },
    videoId: "fXG76h8-9sA"
  },
  smart: {
    title: { ar: "الأهداف الذكية (SMART)", en: "SMART Goals" },
    description: {
      ar: "منهجية تضمن أن أهدافك محددة بوضوح وقابلة للتحقيق في إطار زمني معين.",
      en: "A methodology that ensures your goals are clearly defined and achievable within a time frame."
    },
    videoId: "D-K8-0_P0kQ"
  }
};