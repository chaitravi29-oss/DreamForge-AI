import React, { useState, useRef, useEffect } from "react";
import { 
  Compass, 
  CheckSquare, 
  BookOpen, 
  Award, 
  MessageSquare, 
  BarChart3, 
  Sparkles, 
  Flame, 
  ArrowRight, 
  User, 
  Send, 
  TrendingUp, 
  Check, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Cpu, 
  Calendar, 
  Layers,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Download,
  Share2,
  ExternalLink,
  ChevronRight,
  Sparkle,
  BookOpenCheck,
  AlertTriangle,
  Zap,
  Library,
  Bookmark,
  Globe,
  Youtube,
  GraduationCap,
  Book,
  FileText
} from "lucide-react";
import { Roadmap, Task, Milestone, ChatMessage, UserStats, AIResource } from "../types";

interface DashboardProps {
  roadmap: Roadmap | null;
  tasks: Task[];
  milestones: Milestone[];
  stats: UserStats;
  chatMessages: ChatMessage[];
  onToggleTask: (milestoneId: string, taskId: string) => void;
  onAddTask: (text: string, timeframe: "daily" | "weekly" | "monthly") => void;
  onDeleteTask: (taskId: string) => void;
  onSendMessage: (text: string) => Promise<void>;
  isChatLoading: boolean;
  isDarkMode: boolean;
  onNavigateToForge: () => void;
}

export default function Dashboard({
  roadmap,
  tasks,
  milestones,
  stats,
  chatMessages,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onSendMessage,
  isChatLoading,
  isDarkMode,
  onNavigateToForge
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "roadmap" | "tasks" | "milestones" | "progress" | "score" | "mentor" | "analytics" | "resources"
  >("overview");

  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskTimeframe, setNewTaskTimeframe] = useState<"daily" | "weekly" | "monthly">("daily");
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [showShareToast, setShowShareToast] = useState(false);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, activeTab]);

  // -- STATE FOR NEW PREMIUM FEATURES --
  // Pomodoro Focus Timer
  const [pomoTime, setPomoTime] = useState(1500); // 25 minutes default
  const [pomoActive, setPomoActive] = useState(false);
  const [pomoIsBreak, setPomoIsBreak] = useState(false);
  
  // AI Daily Quote & Action Plan
  const [aiQuote, setAiQuote] = useState<{ text: string; author: string } | null>(null);
  const [dailyPlan, setDailyPlan] = useState<any[]>([]);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [isPlanLoading, setIsPlanLoading] = useState(false);

  // AI Resources Hub state
  const [resources, setResources] = useState<AIResource[]>(() => {
    try {
      const saved = localStorage.getItem("df_ai_resources_v1");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isResourcesLoading, setIsResourcesLoading] = useState(false);
  const [resourceFilter, setResourceFilter] = useState<string>("all");
  
  // Custom scheduled dates (for calendar interaction)
  const [scheduledDays, setScheduledDays] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem("df_scheduled_days");
      return saved ? JSON.parse(saved) : [5, 12, 19];
    } catch {
      return [5, 12, 19];
    }
  });

  // Milestone scheduling dictionary mapping milestoneId to day of June 2026
  const [milestoneSchedule, setMilestoneSchedule] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem("df_milestone_schedule_v2");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    // Default schedules mapped dynamically
    const fallback: Record<string, number> = {};
    if (milestones && milestones.length > 0) {
      milestones.forEach((m, idx) => {
        fallback[m.id] = [5, 12, 19, 26][idx % 4];
      });
    }
    return fallback;
  });

  const [selectedDay, setSelectedDay] = useState<number>(5);

  // Save Scheduled days
  useEffect(() => {
    localStorage.setItem("df_scheduled_days", JSON.stringify(scheduledDays));
  }, [scheduledDays]);

  // Save Milestone Schedule
  useEffect(() => {
    localStorage.setItem("df_milestone_schedule_v2", JSON.stringify(milestoneSchedule));
  }, [milestoneSchedule]);

  const handleScheduleMilestone = (milestoneId: string, day: number) => {
    setMilestoneSchedule((prev) => {
      const updated = { ...prev };
      // Clear any previous mapping to this day to prevent overlap
      Object.keys(updated).forEach((mId) => {
        if (updated[mId] === day) {
          delete updated[mId];
        }
      });
      updated[milestoneId] = day;
      return updated;
    });
  };

  const handleUnscheduleMilestone = (milestoneId: string) => {
    setMilestoneSchedule((prev) => {
      const updated = { ...prev };
      delete updated[milestoneId];
      return updated;
    });
  };

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
  };

  const [pomoSessionsCompleted, setPomoSessionsCompleted] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("df_pomo_sessions_v2");
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    localStorage.setItem("df_pomo_sessions_v2", pomoSessionsCompleted.toString());
  }, [pomoSessionsCompleted]);

  // Pomodoro timer logic
  useEffect(() => {
    let timerId: any = null;
    if (pomoActive && pomoTime > 0) {
      timerId = setInterval(() => {
        setPomoTime((prev) => prev - 1);
      }, 1000);
    } else if (pomoActive && pomoTime === 0) {
      playTimerBeep();
      if (!pomoIsBreak) {
        // focus ended
        setPomoIsBreak(true);
        setPomoTime(300); // 5 mins break
        setPomoSessionsCompleted((prev) => prev + 1);
        alert("🎯 Focus Session Finished! Excellent dedication. Time for a well-deserved 5-minute break.");
      } else {
        // break ended
        setPomoIsBreak(false);
        setPomoTime(1500); // 25 mins focus
        alert("⚡ Break Complete! Let's resume deep calibration.");
      }
      setPomoActive(false);
    }
    return () => clearInterval(timerId);
  }, [pomoActive, pomoTime, pomoIsBreak]);

  const playTimerBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = "sine";
      oscillator.frequency.value = 880; // A5 pitch
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.6);
    } catch (e) {
      console.warn("Audio Context not enabled by browser policy", e);
    }
  };

  // Fetch contextual AI motivation quote & AI hour-by-hour action plan
  useEffect(() => {
    if (!roadmap) return;
    
    setIsQuoteLoading(true);
    fetch("/api/generate-quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goalName: roadmap.goalName })
    })
    .then(res => res.json())
    .then(data => {
      setAiQuote(data);
    })
    .catch(err => console.log("Serving offline motivational quote."))
    .finally(() => setIsQuoteLoading(false));

    setIsPlanLoading(true);
    fetch("/api/daily-action-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        goalName: roadmap.goalName, 
        difficulty: roadmap.difficulty, 
        timeframe: roadmap.estimatedTime 
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.plan) setDailyPlan(data.plan);
    })
    .catch(err => console.log("Serving offline daily plan."))
    .finally(() => setIsPlanLoading(false));
  }, [roadmap]);

  // Save Recommended Resources
  useEffect(() => {
    localStorage.setItem("df_ai_resources_v1", JSON.stringify(resources));
  }, [resources]);

  // Fetch AI Resources when goalName changes or resources are empty
  useEffect(() => {
    if (!roadmap) {
      setResources([]);
      return;
    }

    const savedGoal = localStorage.getItem("df_resources_goal_name");
    if (savedGoal === roadmap.goalName && resources.length > 0) {
      // Already fetched for this goal
      return;
    }

    const fetchResources = async () => {
      setIsResourcesLoading(true);
      try {
        const res = await fetch("/api/recommend-resources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            goalName: roadmap.goalName,
            category: roadmap.category,
            difficulty: roadmap.difficulty,
          }),
        });
        if (!res.ok) throw new Error("Failed to fetch resources");
        const data = await res.json();
        if (data && data.resources) {
          const formatted = data.resources.map((r: any) => ({
            ...r,
            isBookmarked: false,
            isCompleted: false,
          }));
          setResources(formatted);
          localStorage.setItem("df_resources_goal_name", roadmap.goalName);
        }
      } catch (err) {
        console.log("Serving offline recommended resources.");
      } finally {
        setIsResourcesLoading(false);
      }
    };

    fetchResources();
  }, [roadmap?.goalName]);

  const handleToggleBookmarkResource = (id: string) => {
    setResources(prev =>
      prev.map(r => (r.id === id ? { ...r, isBookmarked: !r.isBookmarked } : r))
    );
  };

  const handleToggleCompletedResource = (id: string) => {
    setResources(prev =>
      prev.map(r => (r.id === id ? { ...r, isCompleted: !r.isCompleted } : r))
    );
  };

  // Dynamic Gamified XP System Computations
  const totalCompletedSubtasks = tasks.filter(t => t.isCompleted).length;
  const totalCompletedMilestones = milestones.filter(m => m.isCompleted).length;
  const streakXP = stats.streakDays * 150;
  const userXP = totalCompletedSubtasks * 100 + totalCompletedMilestones * 500 + streakXP;
  const userLevel = Math.floor(userXP / 1000) + 1;
  const currentLevelXP = userXP % 1000;
  const xpNeeded = 1000;

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;
    onSendMessage(chatInput.trim());
    setChatInput("");
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    onAddTask(newTaskText.trim(), newTaskTimeframe);
    setNewTaskText("");
  };

  // Helper to filter tasks by timeframe
  const dailyTasks = tasks.filter(t => t.timeframe === "daily");
  const weeklyTasks = tasks.filter(t => t.timeframe === "weekly");
  const monthlyTasks = tasks.filter(t => t.timeframe === "monthly");

  // Percentage calculations
  const progressPercent = stats.totalTasksCount > 0 
    ? Math.round((stats.completedTasksCount / stats.totalTasksCount) * 100) 
    : 0;

  const milestonesPercent = stats.totalMilestonesCount > 0
    ? Math.round((stats.completedMilestonesCount / stats.totalMilestonesCount) * 100)
    : 0;

  // Render Section Components
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-7xl mx-auto py-4 px-4 min-h-[calc(100vh-120px)] items-start">
      
      {/* SIDEBAR NAVIGATION */}
      <div className="lg:col-span-3 flex flex-col gap-4">
        {/* Quick Profile Summary */}
        <div className={`p-5 rounded-2xl border ${isDarkMode ? 'glass bg-white/3 border-white/8' : 'glass-card-light shadow-sm'} relative overflow-hidden`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="overflow-hidden flex-1">
              <h3 className={`font-display text-sm font-semibold truncate ${isDarkMode ? 'text-white neon-text' : 'text-gray-900'}`}>
                {roadmap ? roadmap.goalName : "Uncalibrated Agent"}
              </h3>
              <p className={`text-[10px] font-mono uppercase tracking-wider ${isDarkMode ? 'text-indigo-300' : 'text-cyan-600'}`}>
                {roadmap ? `${roadmap.category}` : "Status: Awaiting Calibration"}
              </p>
            </div>
          </div>

          {/* XP & LEVELING SYSTEM */}
          <div className="mt-4 pt-4 border-t border-slate-700/15">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-mono text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                <Sparkle className="w-3 h-3 text-indigo-400 animate-pulse" /> Level {roadmap ? userLevel : 0}
              </span>
              <span className="font-mono text-[10px] text-slate-400">{roadmap ? `${currentLevelXP} / ${xpNeeded} XP` : "0 / 0 XP"}</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full transition-all duration-500" 
                style={{ width: `${roadmap ? (currentLevelXP / xpNeeded) * 100 : 0}%` }}
              />
            </div>
          </div>
          
          <div className="mt-3 flex justify-between items-center text-xs">
            <span className={isDarkMode ? 'text-slate-400' : 'text-gray-500'}>Goal Mastery</span>
            <span className="font-mono font-bold text-indigo-400 text-xs neon-text">{stats.achievementScore}%</span>
          </div>
          <div className="flex justify-between items-center text-xs mt-1.5">
            <span className={isDarkMode ? 'text-slate-400' : 'text-gray-500'}>Logged Progress</span>
            <span className={`font-mono ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {stats.completedTasksCount}/{stats.totalTasksCount} subtasks
            </span>
          </div>

          {/* ACTIVE STREAK BURNER */}
          {stats.streakDays > 0 && (
            <div className="mt-3 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-between text-xs text-orange-400">
              <span className="font-sans font-medium flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-500 animate-bounce" /> Active Streak
              </span>
              <span className="font-mono font-bold">{stats.streakDays} Days</span>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className={`p-2 rounded-2xl flex flex-col gap-1 border ${isDarkMode ? 'glass bg-white/3 border-white/8' : 'glass-card-light shadow-sm'}`}>
          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
              activeTab === "overview"
                ? "glass bg-white/10 border-indigo-500/30 text-indigo-300 neon-text font-bold"
                : `${isDarkMode ? 'text-slate-400 hover:text-white glass-hover' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Layers className="w-4 h-4" /> Goal Overview
            </span>
          </button>

          <button
            onClick={() => setActiveTab("roadmap")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
              activeTab === "roadmap"
                ? "glass bg-white/10 border-indigo-500/30 text-indigo-300 neon-text font-bold"
                : `${isDarkMode ? 'text-slate-400 hover:text-white glass-hover' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Compass className="w-4 h-4" /> Roadmap System
            </span>
            {roadmap && <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300">{progressPercent}%</span>}
          </button>

          <button
            onClick={() => setActiveTab("tasks")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
              activeTab === "tasks"
                ? "glass bg-white/10 border-indigo-500/30 text-indigo-300 neon-text font-bold"
                : `${isDarkMode ? 'text-slate-400 hover:text-white glass-hover' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`
            }`}
          >
            <span className="flex items-center gap-2.5">
              <CheckSquare className="w-4 h-4" /> Daily Task Planner
            </span>
            {tasks.length > 0 && (
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-300">
                {tasks.filter(t => t.isCompleted).length}/{tasks.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("milestones")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
              activeTab === "milestones"
                ? "glass bg-white/10 border-indigo-500/30 text-indigo-300 neon-text font-bold"
                : `${isDarkMode ? 'text-slate-400 hover:text-white glass-hover' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`
            }`}
          >
            <span className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4" /> Milestone Tracker
            </span>
            {roadmap && (
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-md bg-pink-500/10 text-pink-300">
                {stats.completedMilestonesCount}/{stats.totalMilestonesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("resources")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
              activeTab === "resources"
                ? "glass bg-white/10 border-indigo-500/30 text-indigo-300 neon-text font-bold"
                : `${isDarkMode ? 'text-slate-400 hover:text-white glass-hover' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Library className="w-4 h-4" /> AI Resource Hub
            </span>
            {roadmap && resources.length > 0 && (
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300">
                {resources.filter(r => r.isCompleted).length}/{resources.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("progress")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
              activeTab === "progress"
                ? "glass bg-white/10 border-indigo-500/30 text-indigo-300 neon-text font-bold"
                : `${isDarkMode ? 'text-slate-400 hover:text-white glass-hover' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Layers className="w-4 h-4" /> Progress Tracking
            </span>
          </button>

          <button
            onClick={() => setActiveTab("score")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
              activeTab === "score"
                ? "glass bg-white/10 border-indigo-500/30 text-indigo-300 neon-text font-bold"
                : `${isDarkMode ? 'text-slate-400 hover:text-white glass-hover' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Award className="w-4 h-4" /> Achievement Score
            </span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-300">{stats.achievementScore} pts</span>
          </button>

          <button
            onClick={() => setActiveTab("mentor")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
              activeTab === "mentor"
                ? "glass bg-white/10 border-indigo-500/30 text-indigo-300 neon-text font-bold"
                : `${isDarkMode ? 'text-slate-400 hover:text-white glass-hover' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`
            }`}
          >
            <span className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4" /> AI Mentor Chat
            </span>
            {roadmap && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
              activeTab === "analytics"
                ? "glass bg-white/10 border-indigo-500/30 text-indigo-300 neon-text font-bold"
                : `${isDarkMode ? 'text-slate-400 hover:text-white glass-hover' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`
            }`}
          >
            <span className="flex items-center gap-2.5">
              <BarChart3 className="w-4 h-4" /> Goal Analytics
            </span>
          </button>
        </div>

        {/* Back to Calibration Button */}
        <button
          onClick={onNavigateToForge}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-display text-xs font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-95 shadow-md shadow-indigo-500/10 cursor-pointer`}
        >
          <Sparkles className="w-4 h-4" /> Forge New Goal
        </button>
      </div>

      {/* PRIMARY VIEWER WINDOW */}
      <div className="lg:col-span-9 space-y-6">

        {/* ALERT IF IN EMPTY STATE */}
        {!roadmap && (
          <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <h4 className="font-semibold text-amber-400 mb-1">Awaiting Dream Calibration</h4>
              <p className={isDarkMode ? 'text-slate-300' : 'text-gray-600'}>
                All dashboard metrics, progress tracks, and score points currently stand at <strong>0</strong>. 
                Please click the <strong>"Forge New Goal"</strong> button in the sidebar or use the homepage to calibrate your target and instantiate a personalized roadmap!
              </p>
            </div>
          </div>
        )}

        {/* TAB CONTENTS */}

        {/* 1. GOAL OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-fadeIn print:space-y-4">
            {/* Main banner card */}
            <div className={`p-6 md:p-8 rounded-3xl border relative overflow-hidden ${isDarkMode ? 'glass bg-white/3 border-white/8' : 'glass-card-light shadow-md'}`}>
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-2.5 py-1 text-[10px] font-mono rounded bg-indigo-500/10 text-indigo-300 uppercase tracking-widest border border-indigo-500/20 neon-text">
                  {roadmap ? roadmap.category : "UNSPECIFIED"}
                </span>
                <span className="px-2.5 py-1 text-[10px] font-mono rounded bg-purple-500/10 text-purple-300 uppercase tracking-widest border border-purple-500/20">
                  {roadmap ? `${roadmap.difficulty} DIFFICULTY` : "LEVEL: 0"}
                </span>
                <span className="px-2.5 py-1 text-[10px] font-mono rounded bg-pink-500/10 text-pink-300 uppercase tracking-widest border border-pink-500/20">
                  {roadmap ? roadmap.estimatedTime : "DURATION: 0"}
                </span>
              </div>

              <h1 className={`font-display text-2xl md:text-3xl font-bold tracking-tight mb-4 ${isDarkMode ? 'text-white neon-text' : 'text-gray-900'}`}>
                {roadmap ? roadmap.goalName : "Calibration Blueprint Chamber"}
              </h1>

              <p className={`text-sm leading-relaxed mb-6 ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                {roadmap 
                  ? roadmap.description 
                  : "Welcome to DreamForge AI. Once you supply an aspirational objective, the intelligence matrix will dissect it into chronological phases, synthesize daily micro-habits, and appoint a virtual specialist mentor to direct your curriculum."
                }
              </p>

              {roadmap && (
                <div className="p-4 rounded-xl border border-indigo-500/15 bg-white/2">
                  <div className="flex items-center gap-2 text-indigo-300 text-xs font-mono uppercase tracking-wider mb-2 font-semibold neon-text">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    Quick Start Smart Recommendations:
                  </div>
                  <ul className="space-y-1.5 text-xs">
                    {roadmap.initialRecommendations.map((rec, idx) => (
                      <li key={idx} className={`flex items-start gap-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                        <span className="text-indigo-400 font-bold font-mono">0{idx+1}.</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* PDF & Share Progress Actions Row */}
              {roadmap && (
                <div className="flex flex-wrap gap-2.5 mt-5 border-t border-slate-700/15 pt-4 no-print">
                  <button
                    onClick={() => window.print()}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                      isDarkMode 
                        ? 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/8' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-400" /> Export PDF
                  </button>

                  <button
                    onClick={() => {
                      const shareText = `🌟 DreamForge AI Accomplishments 🌟\nGoal: ${roadmap.goalName}\nLevel: ${userLevel}\nActive Streak: ${stats.streakDays} Days\nScore: ${stats.achievementScore}%\nMilestones Completed: ${stats.completedMilestonesCount}/${stats.totalMilestonesCount}\nForge your dreams with DreamForge AI!`;
                      navigator.clipboard.writeText(shareText);
                      setShowShareToast(true);
                      setTimeout(() => setShowShareToast(false), 3000);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                      isDarkMode 
                        ? 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/8' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <Share2 className="w-3.5 h-3.5 text-purple-400" /> Share Goal
                  </button>

                  {showShareToast && (
                    <span className="text-[10px] font-mono text-emerald-400 self-center animate-pulse">
                      ✓ Progress copied to clipboard!
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* AI Daily Motivation Quote */}
            {roadmap && (
              <div className={`p-5 rounded-2xl border flex items-start gap-4 relative overflow-hidden ${
                isDarkMode 
                  ? 'glass bg-indigo-500/5 border-indigo-500/15' 
                  : 'bg-indigo-50/30 border-indigo-100 shadow-sm'
              }`}>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-semibold mb-1">
                    AI-Generated Daily Motivation Quote
                  </h4>
                  {isQuoteLoading ? (
                    <div className="space-y-1 mt-1.5">
                      <div className="h-3 bg-white/5 animate-pulse rounded w-64" />
                      <div className="h-2 bg-white/5 animate-pulse rounded w-32" />
                    </div>
                  ) : (
                    <p className={`text-xs italic leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      "{aiQuote ? aiQuote.text : "The forge does not test the steel for its weakness, but to reveal its ultimate, unbreakable potential."}"
                      <span className="block not-italic text-[10px] font-mono font-semibold text-slate-400 mt-1">
                        — {aiQuote ? aiQuote.author : "Master Coach Persona"}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Grid of details: Mentor Avatar & Interactive Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mentor Avatar Panel */}
              <div className={`p-6 rounded-2xl border ${isDarkMode ? 'glass bg-white/3 border-white/8' : 'glass-card-light shadow-sm'}`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-md flex items-center justify-center text-white font-display font-semibold text-lg">
                    {roadmap ? roadmap.mentorName.charAt(0) : "M"}
                  </div>
                  <div>
                    <h3 className={`font-display font-semibold ${isDarkMode ? 'text-white neon-text' : 'text-gray-900'}`}>
                      {roadmap ? roadmap.mentorName : "AI Master Coach"}
                    </h3>
                    <p className="text-[10px] font-mono text-indigo-300 uppercase tracking-widest">
                      {roadmap ? "Your Assigned Guide" : "Awaiting Call"}
                    </p>
                  </div>
                </div>
                <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                  {roadmap 
                    ? roadmap.mentorPersonality 
                    : "Calibrate a goal to receive an AI specialist mentor tailored with personal expertise, specific to your objectives."
                  }
                </p>
              </div>

              {/* Core Skills Panel with Interactive Progress */}
              <div className={`p-6 rounded-2xl border ${isDarkMode ? 'glass bg-white/3 border-white/8' : 'glass-card-light shadow-sm'}`}>
                <h3 className={`font-display font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white neon-text' : 'text-gray-900'}`}>
                  <Cpu className="w-4 h-4 text-indigo-400" /> Key Skills to Acquire
                </h3>

                {roadmap ? (
                  <div className="space-y-4">
                    {roadmap.skillsToAcquire.map((skill, idx) => {
                      // Dynamically compute progress based on milestones
                      const skillProgress = Math.min(15 + milestonesPercent * 0.85, 100);
                      return (
                        <div key={idx} className="border-b border-slate-700/5 pb-3 last:border-b-0 last:pb-0">
                          <div className="flex justify-between items-center mb-1.5">
                            <h4 className={`text-xs font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {skill.name}
                            </h4>
                            <span className="font-mono text-[9px] text-indigo-400 font-bold">{Math.round(skillProgress)}%</span>
                          </div>
                          <p className={`text-[11px] mb-2 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                            {skill.description}
                          </p>
                          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500" 
                              style={{ width: `${skillProgress}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                      No calibrated skills. Score: 0.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Resource Recommendation Section */}
            {roadmap && (
              <div className={`p-6 rounded-3xl border ${isDarkMode ? 'glass bg-white/3 border-white/8' : 'glass-card-light shadow-md'} space-y-4`}>
                <h3 className={`font-display text-base font-semibold flex items-center gap-2.5 ${isDarkMode ? 'text-white neon-text' : 'text-gray-900'}`}>
                  <BookOpenCheck className="w-5 h-5 text-indigo-400" /> Curated Masterclass Primers & Learning Resources
                </h3>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  Handpicked books, video modules, and technical primers custom recommendation based on category.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  {(() => {
                    const cat = roadmap.category?.toLowerCase() || "";
                    let recs = [
                      { type: "Book", title: "Atomic Habits: Micro-Routines", detail: "James Clear • Systemize your micro-routines for victory", duration: "320 pages" },
                      { type: "Video", title: "Mastering the Art of Disciplined Focus", detail: "Psychology behind deep work and breaking procrastination loops", duration: "1.5 hrs video" },
                      { type: "Article", title: "Chronological Roadmap Sprints", detail: "How high-achievers isolate focus to dominate quarterly sprint targets", duration: "8 min read" }
                    ];
                    if (cat.includes("tech") || cat.includes("code") || cat.includes("dev") || cat.includes("program")) {
                      recs = [
                        { type: "Book", title: "Clean Code & Architecture", detail: "Robert C. Martin • Classic blueprint study guide", duration: "450 pages" },
                        { type: "Video", title: "Full-Stack System Design Fundamentals", detail: "High-level interactive service architecture primers", duration: "4.5 hrs video" },
                        { type: "Article", title: "The Pragmatic Path to Self-Taught Engineering", detail: "Tactical guidelines for continuous integration", duration: "12 min read" }
                      ];
                    } else if (cat.includes("health") || cat.includes("run") || cat.includes("fitness") || cat.includes("sport") || cat.includes("wellness")) {
                      recs = [
                        { type: "Book", title: "The Science of Endurance Training", detail: "Pragmatic guide to aerobic base building and hydration", duration: "320 pages" },
                        { type: "Video", title: "Perfecting Your Stride & Form", detail: "Olympic masterclass on injury prevention and pacing", duration: "1.2 hrs video" },
                        { type: "Article", title: "Macro-nutrition Scheduling", detail: "Optimal carbohydrate loading and muscle recovery schedules", duration: "15 min read" }
                      ];
                    } else if (cat.includes("create") || cat.includes("art") || cat.includes("music") || cat.includes("write")) {
                      recs = [
                        { type: "Book", title: "The Artist's Way: Spiritual Creativity", detail: "Julia Cameron • Techniques to bypass creative friction", duration: "280 pages" },
                        { type: "Video", title: "Composition Theory & Visual Storytelling", detail: "In-depth guide to color, pacing, and core message", duration: "2.8 hrs video" },
                        { type: "Article", title: "Formulating Habits for Elite Creative Outputs", detail: "How top creators structure distraction-free daily rituals", duration: "10 min read" }
                      ];
                    }
                    return recs.map((rec, i) => (
                      <div 
                        key={i} 
                        className={`p-4 rounded-xl border flex flex-col justify-between ${
                          isDarkMode ? 'bg-white/2 border-white/5 hover:border-indigo-500/25' : 'bg-slate-50/50 border-slate-100 hover:border-slate-200'
                        } transition-all`}
                      >
                        <div>
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase tracking-wider font-semibold ${
                            rec.type === "Book" ? "bg-indigo-500/10 text-indigo-300" : rec.type === "Video" ? "bg-purple-500/10 text-purple-300" : "bg-pink-500/10 text-pink-300"
                          }`}>
                            {rec.type}
                          </span>
                          <h4 className={`text-xs font-bold mt-2.5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{rec.title}</h4>
                          <p className={`text-[10px] mt-1 leading-normal ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{rec.detail}</p>
                        </div>
                        <span className="text-[9px] font-mono text-slate-500 mt-3 block">{rec.duration}</span>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. ROADMAP SYSTEM */}
        {activeTab === "roadmap" && (
          <div className={`p-6 md:p-8 rounded-3xl border ${isDarkMode ? 'glass bg-white/3 border-white/8' : 'glass-card-light shadow-md'} space-y-6 animate-fadeIn`}>
            <div>
              <h2 className={`font-display text-xl font-bold flex items-center gap-2.5 ${isDarkMode ? 'text-white neon-text' : 'text-gray-900'}`}>
                <Compass className="w-5 h-5 text-indigo-400" /> Sequential Roadmap System
              </h2>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                Check off daily and weekly tasks below to complete milestones and advance your score.
              </p>
            </div>

            {/* Horizontal Timeline indicator */}
            <div className="relative pt-2 pb-6">
              <div className="absolute top-5 left-4 right-4 h-0.5 bg-white/5"></div>
              <div 
                className="absolute top-5 left-4 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                style={{ width: `${milestonesPercent}%` }}
              ></div>
              
              <div className="relative flex justify-between">
                {milestones.length > 0 ? (
                  milestones.map((milestone, idx) => (
                    <div key={milestone.id} className="flex flex-col items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold border transition-all z-10 ${
                        milestone.isCompleted
                          ? "bg-indigo-500 border-indigo-400 text-white shadow shadow-indigo-400/50"
                          : isDarkMode
                            ? "bg-slate-950 border-white/10 text-slate-400"
                            : "bg-white border-gray-300 text-gray-500 shadow-sm"
                      }`}>
                        {milestone.isCompleted ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                      </div>
                      <span className={`text-[10px] font-mono uppercase tracking-wider mt-2 max-w-[100px] text-center truncate ${
                        milestone.isCompleted 
                          ? "text-indigo-400 font-semibold" 
                          : isDarkMode ? "text-slate-500" : "text-gray-400"
                      }`}>
                        {milestone.title}
                      </span>
                    </div>
                  ))
                ) : (
                  [1, 2, 3, 4].map((step) => (
                    <div key={step} className="flex flex-col items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold border z-10 ${
                        isDarkMode ? "bg-slate-950 border-white/5 text-slate-600" : "bg-white border-gray-200 text-gray-300"
                      }`}>
                        {step}
                      </div>
                      <span className="text-[10px] font-mono uppercase text-slate-500 mt-2">Stage 0{step}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* List of Milestones with expandable Tasks */}
            <div className="space-y-4">
              {milestones.length > 0 ? (
                milestones.map((milestone, mIdx) => (
                  <div 
                    key={milestone.id} 
                    className={`p-5 rounded-2xl border transition-all ${
                      milestone.isCompleted
                        ? isDarkMode
                          ? "border-indigo-500/30 bg-indigo-500/5"
                          : "border-indigo-200 bg-indigo-50/20"
                        : isDarkMode
                          ? "border-white/8 bg-white/3 hover:border-indigo-500/25"
                          : "border-slate-100 bg-white shadow-sm hover:border-slate-200"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-[9px] font-mono rounded bg-white/5 text-slate-300 uppercase font-semibold">
                            Week {milestone.targetWeek} Target
                          </span>
                          {milestone.isCompleted && (
                            <span className="px-2 py-0.5 text-[9px] font-mono rounded bg-emerald-500/10 text-emerald-400 uppercase font-semibold">
                              Achieved
                            </span>
                          )}
                        </div>
                        <h3 className={`font-display text-base font-semibold mt-1.5 ${isDarkMode ? 'text-white neon-text' : 'text-gray-900'}`}>
                          {mIdx + 1}. {milestone.title}
                        </h3>
                        <p className={`text-xs mt-1 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                          {milestone.description}
                        </p>
                      </div>

                      {/* Score Badge */}
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-mono text-slate-400 uppercase">Subtasks</span>
                        <span className={`font-mono font-bold ${isDarkMode ? 'text-white neon-text' : 'text-gray-800'}`}>
                          {milestone.tasks.filter(t => t.isCompleted).length} / {milestone.tasks.length}
                        </span>
                      </div>
                    </div>

                    {/* Milestone task list checkboxes */}
                    <div className={`mt-3 pt-3 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-100'} space-y-2.5`}>
                      {milestone.tasks.map((task) => (
                        <div 
                          key={task.id} 
                          className="flex items-start gap-3 cursor-pointer"
                          onClick={() => onToggleTask(milestone.id, task.id)}
                        >
                          <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border shrink-0 transition-all ${
                            task.isCompleted
                              ? "bg-indigo-500 border-indigo-400 text-white"
                              : isDarkMode
                                ? "bg-white/5 border-white/10 hover:border-indigo-500/50"
                                : "bg-white border-gray-300 hover:border-indigo-500"
                          }`}>
                            {task.isCompleted && <Check className="w-3 h-3" />}
                          </div>
                          <div className="flex-1">
                            <p className={`text-xs leading-normal transition-all ${
                              task.isCompleted
                                ? "line-through text-slate-500 font-medium"
                                : isDarkMode ? "text-slate-200" : "text-gray-700"
                            }`}>
                                {task.text}
                            </p>
                            <span className={`text-[9px] font-mono uppercase tracking-wider ${
                              task.timeframe === 'daily' ? 'text-indigo-300' : task.timeframe === 'weekly' ? 'text-purple-300' : 'text-pink-300'
                            }`}>
                              {task.timeframe} Plan
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Compass className="w-10 h-10 text-slate-600 mx-auto mb-3 animate-pulse" />
                  <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    Your sequential roadmap system is currently offline.
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Calibrate a goal on the homepage to generate high-fidelity milestones and interactive progress charts.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. TASKS PLANNER */}
        {activeTab === "tasks" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
            {/* Left Main column */}
            <div className={`lg:col-span-8 p-6 md:p-8 rounded-3xl border ${isDarkMode ? 'glass bg-white/3 border-white/8' : 'glass-card-light shadow-md'} space-y-6`}>
              <div>
                <h2 className={`font-display text-xl font-bold flex items-center gap-2.5 ${isDarkMode ? 'text-white neon-text' : 'text-gray-900'}`}>
                  <CheckSquare className="w-5 h-5 text-indigo-400" /> Daily, Weekly & Monthly Rituals
                </h2>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  Manage and log custom activities alongside AI-generated curriculum items.
                </p>
              </div>

              {/* Custom Task Addition Form */}
              <form onSubmit={handleCreateTask} className="flex flex-wrap gap-3">
                <input
                  type="text"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  placeholder="Add custom task or daily ritual..."
                  className={`flex-1 min-w-[200px] px-4 py-2.5 text-xs rounded-xl border outline-none font-sans ${
                    isDarkMode
                      ? "bg-white/5 border-white/8 text-white placeholder-slate-500 focus:border-indigo-500/50"
                      : "bg-white border-slate-200 text-gray-900 placeholder-slate-400 focus:border-indigo-500"
                  }`}
                />
                <select
                  value={newTaskTimeframe}
                  onChange={(e) => setNewTaskTimeframe(e.target.value as "daily" | "weekly" | "monthly")}
                  className={`px-3 py-2.5 text-xs rounded-xl border outline-none font-mono ${
                    isDarkMode
                      ? "bg-white/5 border-white/8 text-white focus:border-indigo-500/50"
                      : "bg-white border-slate-200 text-gray-900"
                  }`}
                >
                  <option value="daily" className="bg-[#05070A]">Daily Plan</option>
                  <option value="weekly" className="bg-[#05070A]">Weekly Mission</option>
                  <option value="monthly" className="bg-[#05070A]">Monthly Review</option>
                </select>
                <button
                  type="submit"
                  disabled={!newTaskText.trim()}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-95 text-white font-display text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50 transition-all shadow-md shadow-indigo-500/20"
                >
                  <Plus className="w-4 h-4" /> Add Task
                </button>
              </form>

              {/* Timeframe Columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* DAILY ACTION PLAN */}
                <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-white/3 border-white/5' : 'bg-slate-50/50 border-slate-100'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`font-display text-sm font-semibold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      <Calendar className="w-4 h-4 text-indigo-400" /> Daily Actions
                    </h3>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300">
                      {dailyTasks.filter(t => t.isCompleted).length}/{dailyTasks.length}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {dailyTasks.length > 0 ? (
                      dailyTasks.map(task => (
                        <div 
                          key={task.id} 
                          className={`flex items-start justify-between gap-2 p-2.5 rounded-xl border transition-all ${
                            task.isCompleted
                              ? isDarkMode ? "bg-slate-950/40 border-transparent text-slate-500" : "bg-white border-transparent text-gray-400"
                              : isDarkMode ? "bg-white/5 border-white/5 text-slate-200" : "bg-white border-slate-200 shadow-sm text-gray-700"
                          }`}
                        >
                          <div 
                            className="flex items-start gap-2.5 flex-1 cursor-pointer"
                            onClick={() => onToggleTask("custom", task.id)}
                          >
                            <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border shrink-0 transition-all ${
                              task.isCompleted
                                ? "bg-indigo-500 border-indigo-400 text-white"
                                : isDarkMode ? "bg-slate-950 border-white/10" : "bg-white border-gray-300"
                            }`}>
                              {task.isCompleted && <Check className="w-3 h-3" />}
                            </div>
                            <span className={`text-xs ${task.isCompleted ? 'line-through' : ''}`}>
                              {task.text}
                            </span>
                          </div>
                          <button 
                            onClick={() => onDeleteTask(task.id)}
                            className="text-slate-500 hover:text-red-400 p-0.5 shrink-0 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-center py-6 text-xs text-slate-500">0 daily plans active.</p>
                    )}
                  </div>
                </div>

                {/* WEEKLY MISSIONS */}
                <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-white/3 border-white/5' : 'bg-slate-50/50 border-slate-100'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`font-display text-sm font-semibold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      <Compass className="w-4 h-4 text-purple-300 animate-pulse" /> Weekly Missions
                    </h3>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300">
                      {weeklyTasks.filter(t => t.isCompleted).length}/{weeklyTasks.length}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {weeklyTasks.length > 0 ? (
                      weeklyTasks.map(task => (
                        <div 
                          key={task.id} 
                          className={`flex items-start justify-between gap-2 p-2.5 rounded-xl border transition-all ${
                            task.isCompleted
                              ? isDarkMode ? "bg-slate-950/40 border-transparent text-slate-500" : "bg-white border-transparent text-gray-400"
                              : isDarkMode ? "bg-white/5 border-white/5 text-slate-200" : "bg-white border-slate-200 shadow-sm text-gray-700"
                          }`}
                        >
                          <div 
                            className="flex items-start gap-2.5 flex-1 cursor-pointer"
                            onClick={() => onToggleTask("custom", task.id)}
                          >
                            <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border shrink-0 transition-all ${
                              task.isCompleted
                                ? "bg-purple-500 border-purple-400 text-white"
                                : isDarkMode ? "bg-slate-950 border-white/10" : "bg-white border-gray-300"
                            }`}>
                              {task.isCompleted && <Check className="w-3 h-3" />}
                            </div>
                            <span className={`text-xs ${task.isCompleted ? 'line-through' : ''}`}>
                              {task.text}
                            </span>
                          </div>
                          <button 
                            onClick={() => onDeleteTask(task.id)}
                            className="text-slate-500 hover:text-red-400 p-0.5 shrink-0 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-center py-6 text-xs text-slate-500">0 weekly missions active.</p>
                    )}
                  </div>
                </div>

                {/* MONTHLY REVIEWS */}
                <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-white/3 border-white/5' : 'bg-slate-50/50 border-slate-100'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`font-display text-sm font-semibold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      <Award className="w-4 h-4 text-pink-300" /> Monthly Reviews
                    </h3>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400">
                      {monthlyTasks.filter(t => t.isCompleted).length}/{monthlyTasks.length}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {monthlyTasks.length > 0 ? (
                      monthlyTasks.map(task => (
                        <div 
                          key={task.id} 
                          className={`flex items-start justify-between gap-2 p-2.5 rounded-xl border transition-all ${
                            task.isCompleted
                              ? isDarkMode ? "bg-slate-950/40 border-transparent text-slate-500" : "bg-white border-transparent text-gray-400"
                              : isDarkMode ? "bg-white/5 border-white/5 text-slate-200" : "bg-white border-slate-200 shadow-sm text-gray-700"
                          }`}
                        >
                          <div 
                            className="flex items-start gap-2.5 flex-1 cursor-pointer"
                            onClick={() => onToggleTask("custom", task.id)}
                          >
                            <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border shrink-0 transition-all ${
                              task.isCompleted
                                ? "bg-pink-500 border-pink-400 text-white"
                                : isDarkMode ? "bg-slate-950 border-white/10" : "bg-white border-gray-300"
                            }`}>
                              {task.isCompleted && <Check className="w-3 h-3" />}
                            </div>
                            <span className={`text-xs ${task.isCompleted ? 'line-through' : ''}`}>
                              {task.text}
                            </span>
                          </div>
                          <button 
                            onClick={() => onDeleteTask(task.id)}
                            className="text-slate-500 hover:text-red-400 p-0.5 shrink-0 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-center py-6 text-xs text-slate-500">0 monthly reviews active.</p>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Right Premium Utilities Side-column */}
            <div className="lg:col-span-4 space-y-6">
              {/* Pomodoro Focus Timer */}
              <div className={`p-5 rounded-3xl border flex flex-col items-center relative overflow-hidden text-center ${
                isDarkMode ? 'glass bg-white/3 border-white/8' : 'glass-card-light shadow-md'
              }`}>
                <h3 className={`font-display text-sm font-semibold flex items-center gap-1.5 mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  <Clock className="w-4 h-4 text-indigo-400" /> Pomodoro Focus Timer
                </h3>
                <span className="font-mono text-[9px] text-slate-400 uppercase tracking-widest mb-4">
                  {pomoIsBreak ? "🧘 Break Phase" : "⚡ Focus Phase (25/5)"}
                </span>

                {/* Big Countdown Timer */}
                <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-500 transition-all duration-1000" style={{
                    clipPath: `polygon(50% 50%, -50% -50%, ${150 - (pomoTime / (pomoIsBreak ? 300 : 1500)) * 200}% -50%)`,
                    transform: "rotate(-90deg)"
                  }} />
                  <div className="z-10">
                    <span className={`font-mono text-3xl font-extrabold tracking-tight ${isDarkMode ? 'text-white neon-text' : 'text-slate-900'}`}>
                      {Math.floor(pomoTime / 60)}:{(pomoTime % 60).toString().padStart(2, "0")}
                    </span>
                  </div>
                </div>

                {/* Controls Row */}
                <div className="flex gap-2.5">
                  <button
                    onClick={() => setPomoActive(!pomoActive)}
                    className="p-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white shadow-md shadow-indigo-500/20 cursor-pointer"
                  >
                    {pomoActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => {
                      setPomoActive(false);
                      setPomoIsBreak(false);
                      setPomoTime(1500);
                    }}
                    className={`p-2 rounded-xl border cursor-pointer ${
                      isDarkMode ? 'border-white/8 hover:bg-white/5 text-slate-300' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* AI-Generated Daily Action Plan (Curriculum timeline) */}
              <div className={`p-5 rounded-3xl border ${
                isDarkMode ? 'glass bg-white/3 border-white/8' : 'glass-card-light shadow-md'
              }`}>
                <h3 className={`font-display text-sm font-semibold flex items-center gap-1.5 mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  <Cpu className="w-4 h-4 text-purple-400" /> AI Daily Action Plan
                </h3>
                <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mb-4">
                  Hour-By-Hour Recommended Agenda
                </p>

                {isPlanLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex gap-3 animate-pulse">
                        <div className="w-12 h-4 bg-white/5 rounded" />
                        <div className="flex-1 h-3 bg-white/5 rounded" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="relative pl-4 border-l border-indigo-500/15 space-y-4">
                    {dailyPlan.length > 0 ? (
                      dailyPlan.map((item, idx) => (
                        <div key={idx} className="relative group">
                          {/* Node Dot */}
                          <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-[#05070a] group-hover:scale-125 transition-all" />
                          <span className="font-mono text-[10px] font-bold text-indigo-400 tracking-tight">
                            {item.hour || "08:00 AM"}
                          </span>
                          <h4 className={`text-xs font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            {item.action || "Interactive study & training review"}
                          </h4>
                          <p className={`text-[10px] mt-0.5 leading-normal ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            {item.notes || "Deep session of curriculum drilling"}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-center py-4 text-xs text-slate-500 italic">Plan loaded successfully.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 4. MILESTONES LIST */}
        {activeTab === "milestones" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
            {/* Left side list of milestones */}
            <div className={`lg:col-span-7 p-6 md:p-8 rounded-3xl border ${isDarkMode ? 'glass bg-white/3 border-white/8' : 'glass-card-light shadow-md'} space-y-6`}>
              <div>
                <h2 className={`font-display text-xl font-bold flex items-center gap-2.5 ${isDarkMode ? 'text-white neon-text' : 'text-gray-900'}`}>
                  <BookOpen className="w-5 h-5 text-indigo-400" /> Milestone Tracking Board
                </h2>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  High-level milestones and phase accomplishments mapping your progress.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {milestones.length > 0 ? (
                  milestones.map((milestone, idx) => {
                    return (
                      <div 
                        key={milestone.id}
                        className={`p-5 rounded-2xl border relative overflow-hidden transition-all hover:-translate-y-0.5 ${
                          milestone.isCompleted 
                            ? isDarkMode
                              ? 'border-emerald-500/20 bg-emerald-500/5'
                              : 'border-emerald-200 bg-emerald-50/20'
                            : isDarkMode
                              ? 'border-white/8 bg-white/3'
                              : 'border-slate-200 bg-white shadow-sm'
                        }`}
                      >
                        {milestone.isCompleted && (
                          <div className="absolute top-3 right-3 p-1 rounded-full bg-emerald-500 text-white">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-300 neon-text">
                          Phase {idx + 1} • Week {milestone.targetWeek}
                        </span>
                        <h3 className={`font-display text-sm font-bold mt-1 ${isDarkMode ? 'text-white neon-text' : 'text-gray-900'}`}>
                          {milestone.title}
                        </h3>
                        <p className={`text-xs mt-1.5 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                          {milestone.description}
                        </p>
                        
                        {/* Compact stats bar */}
                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Subtask Completion</span>
                          <span className={`font-mono font-bold ${isDarkMode ? 'text-white neon-text' : 'text-gray-800'}`}>
                            {milestone.tasks.filter(t => t.isCompleted).length} / {milestone.tasks.length}
                          </span>
                        </div>

                        {/* Progress Slider */}
                        <div className="w-full bg-white/5 h-1 rounded-full mt-2 overflow-hidden">
                          <div 
                            className="bg-indigo-500 h-full transition-all duration-300"
                            style={{
                              width: `${
                                milestone.tasks.length > 0
                                  ? (milestone.tasks.filter(t => t.isCompleted).length / milestone.tasks.length) * 100
                                  : 0
                              }%`
                            }}
                          />
                        </div>

                        {/* Schedule status */}
                        <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
                          <span className="text-[10px] text-slate-400 font-mono">Target Date:</span>
                          <span className="text-[10px] text-indigo-400 font-mono font-bold">
                            {milestoneSchedule[milestone.id] ? `June ${milestoneSchedule[milestone.id]}, 2026` : 'Unscheduled'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      No milestones configured. Score: 0.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right side Calendar & Interactive Scheduler */}
            <div className={`lg:col-span-5 p-6 md:p-8 rounded-3xl border flex flex-col justify-between ${isDarkMode ? 'glass bg-white/3 border-white/8' : 'glass-card-light shadow-md'} space-y-6`}>
              <div>
                <h3 className={`font-display text-lg font-bold flex items-center gap-2 ${isDarkMode ? 'text-white neon-text' : 'text-slate-900'}`}>
                  <Calendar className="w-5 h-5 text-purple-400 animate-pulse" /> Milestone Scheduler
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Schedule milestone check-ins, view targeted dates, or re-calibrate phases.
                </p>
              </div>

              {/* Month Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>June 2026</span>
                <span className="text-[10px] font-mono text-slate-500 uppercase">Target Month</span>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {/* Days of week header */}
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <span key={day} className="text-[10px] font-mono text-slate-500 font-semibold py-1">{day}</span>
                ))}

                {/* Grid space for June 2026 starting on Monday */}
                <div />

                {/* Days of Month 1 to 30 */}
                {Array.from({ length: 30 }, (_, i) => i + 1).map(day => {
                  const scheduledMilestoneEntry = Object.entries(milestoneSchedule).find(([_, scheduledDay]) => scheduledDay === day);
                  const isScheduled = !!scheduledMilestoneEntry;
                  const isSelected = selectedDay === day;

                  return (
                    <button
                      key={day}
                      onClick={() => handleDayClick(day)}
                      className={`relative aspect-square rounded-xl text-xs font-mono flex flex-col items-center justify-center transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-indigo-500 border-indigo-400 text-white shadow-md shadow-indigo-500/20'
                          : isScheduled
                            ? 'bg-purple-500/15 border-purple-500/30 text-purple-300 font-bold'
                            : isDarkMode
                              ? 'bg-white/2 border-transparent text-slate-300 hover:bg-white/5'
                              : 'bg-slate-50 border-transparent text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{day}</span>
                      {isScheduled && !isSelected && (
                        <span className="absolute bottom-1 w-1 h-1 rounded-full bg-purple-400 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Day Details Calibration Panel */}
              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-white/3 border-white/5' : 'bg-slate-50 border-slate-100'} space-y-4`}>
                <div className="flex items-center justify-between">
                  <h4 className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Selected Date: June {selectedDay}, 2026
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">Calibration Panel</span>
                </div>

                {(() => {
                  const scheduledMilestoneEntry = Object.entries(milestoneSchedule).find(([_, day]) => day === selectedDay);
                  if (scheduledMilestoneEntry) {
                    const [milestoneId] = scheduledMilestoneEntry;
                    const milestoneObj = milestones.find(m => m.id === milestoneId);
                    return (
                      <div className="space-y-2">
                        <span className="text-[10px] text-purple-300 font-mono block">Scheduled Milestone:</span>
                        <h5 className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          {milestoneObj?.title || 'Unknown Milestone'}
                        </h5>
                        <p className="text-[10px] text-slate-400 leading-normal">
                          {milestoneObj?.description || 'No description available.'}
                        </p>
                        <button
                          onClick={() => handleUnscheduleMilestone(milestoneId)}
                          className="text-[10px] text-red-400 hover:text-red-300 font-mono flex items-center gap-1 cursor-pointer mt-1"
                        >
                          <Trash2 className="w-3 h-3" /> Unschedule Date
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      <p className="text-[11px] text-slate-400 leading-normal">
                        No milestone is scheduled for this day. Link a milestone phase to create an active roadmap agenda item.
                      </p>
                      
                      {milestones.length > 0 && (
                        <div className="flex gap-2">
                          <select
                            id="milestoneSelect"
                            className={`flex-1 px-2.5 py-1.5 text-xs rounded-xl border outline-none font-sans ${
                              isDarkMode ? 'bg-slate-950 border-white/8 text-white' : 'bg-white border-slate-200 text-slate-900'
                            }`}
                          >
                            <option value="">-- Choose Phase --</option>
                            {milestones.map((m, idx) => (
                              <option key={m.id} value={m.id}>
                                Phase {idx + 1}: {m.title.substring(0, 24)}...
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => {
                              const sel = document.getElementById('milestoneSelect') as HTMLSelectElement;
                              if (sel && sel.value) {
                                handleScheduleMilestone(sel.value, selectedDay);
                              }
                            }}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-mono text-[10px] font-bold hover:opacity-90 transition-all cursor-pointer"
                          >
                            Schedule
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* AI RESOURCE HUB */}
        {activeTab === "resources" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header section with Stats */}
            <div className={`p-6 md:p-8 rounded-3xl border ${isDarkMode ? 'glass bg-white/3 border-white/8' : 'glass-card-light shadow-md'} flex flex-col md:flex-row justify-between items-start md:items-center gap-6`}>
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-300 neon-text flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" /> Curated Educational Engine
                </span>
                <h2 className={`font-display text-2xl font-bold flex items-center gap-2.5 ${isDarkMode ? 'text-white neon-text' : 'text-gray-900'}`}>
                  <Library className="w-6 h-6 text-indigo-400" /> AI Resource Hub
                </h2>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'} max-w-xl`}>
                  Tailored learning materials curated dynamically by Gemini based on your active target: <strong className="text-indigo-300">"{roadmap?.goalName || 'My Goal'}"</strong>.
                </p>
              </div>

              {/* Resource completion stats */}
              {roadmap && resources.length > 0 && (
                <div className="flex gap-4">
                  <div className={`px-4 py-3 rounded-2xl border ${isDarkMode ? 'bg-white/3 border-white/5' : 'bg-slate-50 border-slate-100'} text-center`}>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Completed</span>
                    <span className={`text-xl font-bold font-mono ${isDarkMode ? 'text-white neon-text' : 'text-gray-800'}`}>
                      {resources.filter(r => r.isCompleted).length} <span className="text-slate-500 text-xs">/ {resources.length}</span>
                    </span>
                  </div>
                  <div className={`px-4 py-3 rounded-2xl border ${isDarkMode ? 'bg-white/3 border-white/5' : 'bg-slate-50 border-slate-100'} text-center`}>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Bookmarks</span>
                    <span className={`text-xl font-bold font-mono ${isDarkMode ? 'text-white neon-text' : 'text-gray-800'}`}>
                      {resources.filter(r => r.isBookmarked).length}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Filter buttons & Refresh curation */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "all", label: "All Resources" },
                  { id: "bookmarked", label: "Bookmarks" },
                  { id: "completed", label: "Completed" },
                  { id: "video", label: "YouTube" },
                  { id: "course", label: "Online Courses" },
                  { id: "book", label: "Books" },
                  { id: "article", label: "Articles" },
                  { id: "website", label: "Practice Sites" }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setResourceFilter(f.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                      resourceFilter === f.id
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 border-indigo-400 text-white shadow-md"
                        : isDarkMode
                          ? "bg-white/3 border-white/5 text-slate-300 hover:bg-white/5"
                          : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {roadmap && (
                <button
                  disabled={isResourcesLoading}
                  onClick={async () => {
                    setIsResourcesLoading(true);
                    try {
                      const res = await fetch("/api/recommend-resources", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          goalName: roadmap.goalName,
                          category: roadmap.category,
                          difficulty: roadmap.difficulty,
                        }),
                      });
                      if (res.ok) {
                        const data = await res.json();
                        if (data && data.resources) {
                          const formatted = data.resources.map((r: any) => ({
                            ...r,
                            isBookmarked: false,
                            isCompleted: false,
                          }));
                          setResources(formatted);
                          localStorage.setItem("df_resources_goal_name", roadmap.goalName);
                        }
                      }
                    } catch (e) {
                      console.log("Serving offline recommended resources on regenerate.");
                    } finally {
                      setIsResourcesLoading(false);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase border ${
                    isDarkMode 
                      ? 'bg-white/3 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10' 
                      : 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100'
                  } transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer`}
                >
                  <Cpu className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: isResourcesLoading ? '1s' : '0s' }} />
                  {isResourcesLoading ? "Curating..." : "Re-Curate AI"}
                </button>
              )}
            </div>

            {/* Main Content Area */}
            {isResourcesLoading ? (
              <div className={`p-12 text-center rounded-3xl border ${isDarkMode ? 'glass bg-white/3 border-white/8' : 'glass-card-light shadow-md'} space-y-4 animate-fadeIn`}>
                <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 border-t-indigo-400 animate-spin" />
                  <Cpu className="w-6 h-6 text-indigo-400 animate-pulse" />
                </div>
                <div className="space-y-1.5 max-w-md mx-auto">
                  <h3 className={`font-display text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    AI Curation Engine In Progress
                  </h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Gemini is parsing your target calibration, indexing authoritative sources across YouTube, Coursera, academic archives, and interactive labs to design your dynamic learning repository...
                  </p>
                </div>
              </div>
            ) : (
              (() => {
                const filtered = resources.filter(r => {
                  if (resourceFilter === "all") return true;
                  if (resourceFilter === "bookmarked") return r.isBookmarked;
                  if (resourceFilter === "completed") return r.isCompleted;
                  return r.type === resourceFilter;
                });

                if (filtered.length === 0) {
                  return (
                    <div className={`p-12 text-center rounded-3xl border ${isDarkMode ? 'glass bg-white/3 border-white/8' : 'glass-card-light shadow-md'} animate-fadeIn`}>
                      <Library className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                      <h3 className={`font-display text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                        No resources matched your filter
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Try selecting another category filter above or trigger "Re-Curate AI" to reload.
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fadeIn">
                    {filtered.map(resource => {
                      const info = (() => {
                        switch (resource.type) {
                          case "video":
                            return {
                              label: "YouTube Video",
                              color: isDarkMode ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-red-50 text-red-600 border-red-200",
                              icon: <Youtube className="w-4 h-4 text-red-400" />
                            };
                          case "course":
                            return {
                              label: "Online Course",
                              color: isDarkMode ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-blue-50 text-blue-600 border-blue-200",
                              icon: <GraduationCap className="w-4 h-4 text-blue-400" />
                            };
                          case "book":
                            return {
                              label: "Book",
                              color: isDarkMode ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-amber-50 text-amber-700 border-amber-200",
                              icon: <Book className="w-4 h-4 text-amber-500" />
                            };
                          case "article":
                            return {
                              label: "Article / Docs",
                              color: isDarkMode ? "bg-teal-500/10 text-teal-400 border-teal-500/20" : "bg-teal-50 text-teal-600 border-teal-200",
                              icon: <FileText className="w-4 h-4 text-teal-400" />
                            };
                          case "website":
                            return {
                              label: "Practice Site",
                              color: isDarkMode ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : "bg-purple-50 text-purple-600 border-purple-200",
                              icon: <Globe className="w-4 h-4 text-purple-400" />
                            };
                          default:
                            return {
                              label: "Resource",
                              color: isDarkMode ? "bg-slate-500/10 text-slate-400 border-slate-500/20" : "bg-slate-50 text-slate-600 border-slate-200",
                              icon: <Library className="w-4 h-4 text-slate-400" />
                            };
                        }
                      })();

                      return (
                        <div
                          key={resource.id}
                          className={`p-5 rounded-2xl border flex flex-col justify-between transition-all duration-300 relative overflow-hidden group ${
                            resource.isCompleted
                              ? isDarkMode
                                ? 'border-emerald-500/20 bg-emerald-500/5'
                                : 'border-emerald-200 bg-emerald-50/10'
                              : isDarkMode
                                ? 'border-white/8 bg-white/3 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5'
                                : 'border-slate-200 bg-white hover:border-indigo-200 hover:shadow-md'
                          }`}
                        >
                          {/* Main Resource Data */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${info.color}`}>
                                {info.icon} {info.label}
                              </span>
                              
                              <span className="text-[10px] font-mono text-slate-400">
                                {resource.durationOrLength}
                              </span>
                            </div>

                            <div className="space-y-1.5">
                              <h3 className={`font-display text-sm font-bold leading-snug ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {resource.title}
                              </h3>
                              <p className={`text-[10px] font-mono font-bold ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>
                                {resource.creatorOrPlatform}
                              </p>
                              <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                {resource.description}
                              </p>
                            </div>
                          </div>

                          {/* Footer action bar */}
                          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between gap-2.5">
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`px-3 py-1.5 rounded-xl text-[11px] font-sans font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                                isDarkMode 
                                  ? 'bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 border border-indigo-500/20' 
                                  : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200'
                              }`}
                            >
                              Explore Resource <ExternalLink className="w-3 h-3" />
                            </a>

                            <div className="flex items-center gap-1.5">
                              {/* Bookmark Toggle */}
                              <button
                                onClick={() => handleToggleBookmarkResource(resource.id)}
                                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                                  resource.isBookmarked
                                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-sm shadow-amber-500/10'
                                    : isDarkMode
                                      ? 'bg-white/3 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/5'
                                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                                }`}
                                title={resource.isBookmarked ? "Remove Bookmark" : "Bookmark Resource"}
                              >
                                <Bookmark className={`w-3.5 h-3.5 ${resource.isBookmarked ? 'fill-amber-400' : ''}`} />
                              </button>

                              {/* Completion Toggle */}
                              <button
                                onClick={() => handleToggleCompletedResource(resource.id)}
                                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                                  resource.isCompleted
                                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-sm shadow-emerald-500/10'
                                    : isDarkMode
                                      ? 'bg-white/3 border-white/5 text-slate-400 hover:text-emerald-400 hover:bg-white/5'
                                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-emerald-600 hover:bg-slate-100'
                                }`}
                                title={resource.isCompleted ? "Mark as Uncompleted" : "Mark as Completed"}
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()
            )}
          </div>
        )}

        {/* 5. PROGRESS TRACKING */}
        {activeTab === "progress" && (
          <div className={`p-6 md:p-8 rounded-3xl border ${isDarkMode ? 'glass bg-white/3 border-white/8' : 'glass-card-light shadow-md'} space-y-6 animate-fadeIn`}>
            <div>
              <h2 className={`font-display text-xl font-bold flex items-center gap-2.5 ${isDarkMode ? 'text-white neon-text' : 'text-gray-900'}`}>
                <Layers className="w-5 h-5 text-indigo-400" /> Progress Tracking Indicators
              </h2>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                Visual breakdown of task accomplishments, streak count, and daily ratios.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* STREAK */}
              <div className={`p-5 rounded-2xl border text-center ${isDarkMode ? 'glass bg-white/3 border-white/5' : 'bg-white shadow-sm border-gray-100'}`}>
                <div className="mx-auto w-12 h-12 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center mb-3">
                  <Flame className="w-6 h-6 animate-bounce" />
                </div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Daily Active Streak</span>
                <span className={`text-3xl font-display font-bold block mt-1.5 ${isDarkMode ? 'text-white neon-text' : 'text-gray-900'}`}>
                  {stats.streakDays} Days
                </span>
                <p className="text-[10px] text-slate-500 mt-1">Consistency is key to forging greatness.</p>
              </div>

              {/* TASK COMPLETION PERCENTAGE */}
              <div className={`p-5 rounded-2xl border text-center ${isDarkMode ? 'glass bg-white/3 border-white/5' : 'bg-white shadow-sm border-gray-100'}`}>
                <div className="mx-auto w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
                  <CheckSquare className="w-6 h-6 text-indigo-400" />
                </div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Task Progression</span>
                <span className={`text-3xl font-display font-bold block mt-1.5 ${isDarkMode ? 'text-white neon-text' : 'text-gray-900'}`}>
                  {progressPercent}%
                </span>
                <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden max-w-[120px] mx-auto">
                  <div className="bg-indigo-500 h-full transition-all" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>

              {/* MILESTONE PROGRESSION */}
              <div className={`p-5 rounded-2xl border text-center ${isDarkMode ? 'glass bg-white/3 border-white/5' : 'bg-white shadow-sm border-gray-100'}`}>
                <div className="mx-auto w-12 h-12 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3">
                  <Layers className="w-6 h-6 text-purple-400" />
                </div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Milestones Completed</span>
                <span className={`text-3xl font-display font-bold block mt-1.5 ${isDarkMode ? 'text-white neon-text' : 'text-gray-900'}`}>
                  {stats.completedMilestonesCount} / {stats.totalMilestonesCount}
                </span>
                <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden max-w-[120px] mx-auto">
                  <div className="bg-purple-500 h-full transition-all" style={{ width: `${milestonesPercent}%` }} />
                </div>
              </div>

            </div>

            {/* 🏅 Premium Achievement Badges System */}
            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-white/3 border-white/5' : 'bg-slate-50 border-slate-100'} space-y-4 mt-6`}>
              <div className="flex justify-between items-center">
                <h3 className={`font-display text-sm font-semibold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" /> Premium Achievement Badges
                </h3>
                <span className="font-mono text-[10px] text-slate-500">DYNAMIC REVELATION ENGAGEMENT</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Unlock high-fidelity milestone titles and unlock micro-animations as your score and calibration indices advance.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-4">
                {[
                  {
                    id: "initiate",
                    title: "Dream Initiate",
                    detail: "Calibrate and establish your first active goal roadmap.",
                    unlocked: !!roadmap,
                    color: "from-indigo-500 to-cyan-500",
                    icon: <Compass className="w-6 h-6" />
                  },
                  {
                    id: "streak",
                    title: "Streak Starter",
                    detail: "Establish an active daily calibration streak.",
                    unlocked: stats.streakDays >= 1,
                    color: "from-orange-500 to-amber-500",
                    icon: <Flame className="w-6 h-6" />
                  },
                  {
                    id: "focused",
                    title: "Focus Master",
                    detail: "Unlock deep focus by completing a Pomodoro session.",
                    unlocked: pomoSessionsCompleted >= 1,
                    color: "from-rose-500 to-pink-500",
                    icon: <Clock className="w-6 h-6" />
                  },
                  {
                    id: "phase",
                    title: "Phase Champion",
                    detail: "Conquer a major milestone stage checklist.",
                    unlocked: stats.completedMilestonesCount >= 1,
                    color: "from-green-500 to-emerald-500",
                    icon: <Award className="w-6 h-6" />
                  },
                  {
                    id: "grandmaster",
                    title: "Forge Grandmaster",
                    detail: "Excel by securing an achievement score >= 80%.",
                    unlocked: stats.achievementScore >= 80,
                    color: "from-purple-600 to-fuchsia-600",
                    icon: <Zap className="w-6 h-6" />
                  }
                ].map((badge) => (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-xl border flex flex-col items-center text-center transition-all duration-500 relative group cursor-pointer ${
                      badge.unlocked
                        ? isDarkMode
                          ? "bg-white/5 border-indigo-500/30 hover:border-indigo-400 hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/10"
                          : "bg-white border-indigo-200 hover:scale-105 hover:shadow-md"
                        : "opacity-40 grayscale hover:grayscale-0"
                    }`}
                  >
                    {/* Badge Glow Ring for Unlocked */}
                    {badge.unlocked && (
                      <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${badge.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                    )}

                    {/* Badge Icon Wrapper */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-transform duration-500 group-hover:rotate-12 ${
                      badge.unlocked
                        ? `bg-gradient-to-br ${badge.color} text-white shadow-md`
                        : "bg-slate-800 text-slate-500"
                    }`}>
                      {badge.icon}
                    </div>

                    <h4 className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {badge.title}
                    </h4>
                    <p className="text-[9px] text-slate-400 mt-1 leading-normal">
                      {badge.detail}
                    </p>

                    {/* Unlock Status Stamp */}
                    <span className={`text-[8px] font-mono font-bold uppercase tracking-widest mt-2.5 px-1.5 py-0.5 rounded ${
                      badge.unlocked
                        ? "bg-indigo-500/10 text-indigo-300"
                        : "bg-slate-800 text-slate-500"
                    }`}>
                      {badge.unlocked ? "✓ Unlocked" : "Locked"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* 6. ACHIEVEMENT SCORE */}
        {activeTab === "score" && (
          <div className={`p-6 md:p-8 rounded-3xl border ${isDarkMode ? 'glass bg-white/3 border-white/8' : 'glass-card-light shadow-md'} space-y-6 animate-fadeIn`}>
            <div>
              <h2 className={`font-display text-xl font-bold flex items-center gap-2.5 ${isDarkMode ? 'text-white neon-text' : 'text-gray-900'}`}>
                <Award className="w-5 h-5 text-indigo-400" /> Achievement Score System
              </h2>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                Calculated dynamically based on milestone accomplishments, tasks logged, and daily active streaks.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center py-8">
              {/* Circular gauge SVG */}
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="88"
                    cy="88"
                    r="75"
                    className={`${isDarkMode ? 'stroke-white/5' : 'stroke-slate-100'} fill-none`}
                    strokeWidth="10"
                  />
                  <circle
                    cx="88"
                    cy="88"
                    r="75"
                    className="stroke-indigo-500 fill-none transition-all duration-1000"
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 75}
                    strokeDashoffset={2 * Math.PI * 75 * (1 - stats.achievementScore / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                
                <div className="absolute text-center">
                  <span className={`text-4xl font-display font-extrabold block text-glow-purple ${isDarkMode ? 'text-white neon-text' : 'text-gray-900'}`}>
                    {stats.achievementScore}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Achievement pts</span>
                </div>
              </div>

              <div className="mt-6 max-w-sm text-center">
                <h3 className={`font-display font-semibold text-sm ${isDarkMode ? 'text-white neon-text' : 'text-gray-900'}`}>
                  Level {stats.achievementScore >= 80 ? "Master Explorer" : stats.achievementScore >= 40 ? "Steady Practitioner" : "New Apprentice"}
                </h3>
                <p className={`text-xs mt-1.5 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  Your Achievement points increase dynamically. Each logged daily task raises your score, and major milestones grant significant multipliers!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 7. AI MENTOR CHAT */}
        {activeTab === "mentor" && (
          <div className={`p-4 md:p-6 rounded-3xl border flex flex-col h-[520px] ${isDarkMode ? 'glass bg-white/3 border-white/8' : 'glass-card-light shadow-md'} animate-fadeIn`}>
            
            {/* Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-white/5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-400 to-purple-500 text-white flex items-center justify-center font-display font-semibold">
                {roadmap ? roadmap.mentorName.charAt(0) : "M"}
              </div>
              <div>
                <h3 className={`font-display text-sm font-semibold ${isDarkMode ? 'text-white neon-text' : 'text-gray-900'}`}>
                  {roadmap ? roadmap.mentorName : "AI Master Mentor"}
                </h3>
                <p className="text-[10px] font-mono text-indigo-300 neon-text">
                  {roadmap ? "Online • Always Available" : "Awaiting Dream Forge Calibration"}
                </p>
              </div>
            </div>

            {/* Message Pane */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <MessageSquare className="w-8 h-8 text-slate-500 mb-2" />
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    No communication logs yet.
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                    {roadmap 
                      ? `Send a message to ${roadmap.mentorName} to initiate strategic training and ask questions about your milestones!`
                      : "Once a goal is forged, your dedicated mentor will respond to queries contextually."
                    }
                  </p>
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex items-start gap-2.5 max-w-[85%] ${
                      msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full text-xs font-bold text-white flex items-center justify-center shrink-0 ${
                      msg.sender === "user" ? "bg-slate-700" : "bg-indigo-600"
                    }`}>
                      {msg.sender === "user" ? "U" : (roadmap ? roadmap.mentorName.charAt(0) : "M")}
                    </div>
                    <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-indigo-600 text-white rounded-tr-none"
                        : isDarkMode
                          ? "bg-white/5 border border-white/5 text-slate-200 rounded-tl-none"
                          : "bg-white border border-slate-200 text-slate-800 shadow-sm rounded-tl-none"
                    }`}>
                      {msg.text.split("\n").map((line, lIdx) => (
                        <p key={lIdx} className={line.startsWith("-") || line.startsWith("*") ? "ml-2.5 pl-0.5" : "mb-1 last:mb-0"}>
                          {line}
                        </p>
                      ))}
                      <span className="block text-[8px] opacity-60 text-right mt-1 font-mono">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ))
              )}

              {isChatLoading && (
                <div className="flex items-center gap-2.5 mr-auto">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-semibold animate-pulse">
                    {roadmap ? roadmap.mentorName.charAt(0) : "M"}
                  </div>
                  <div className={`p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-1`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendChat} className="mt-2 pt-3 border-t border-white/5 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={roadmap ? `Ask ${roadmap.mentorName} a question...` : "Calibrate your goal to enable mentor chat..."}
                disabled={!roadmap || isChatLoading}
                className={`flex-1 px-4 py-2.5 text-xs rounded-xl border outline-none font-sans ${
                  isDarkMode
                    ? "bg-slate-900/60 border-white/10 text-white placeholder-slate-500 focus:border-indigo-500/50"
                    : "bg-white border-slate-200 text-gray-900 placeholder-slate-400 focus:border-indigo-500"
                }`}
              />
              <button
                type="submit"
                disabled={!roadmap || isChatLoading || !chatInput.trim()}
                className="p-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* 8. ANALYTICS */}
        {activeTab === "analytics" && (
          <div className={`p-6 md:p-8 rounded-3xl border ${isDarkMode ? 'glass bg-white/3 border-white/8' : 'glass-card-light shadow-md'} space-y-6 animate-fadeIn`}>
            <div>
              <h2 className={`font-display text-xl font-bold flex items-center gap-2.5 ${isDarkMode ? 'text-white neon-text' : 'text-gray-900'}`}>
                <BarChart3 className="w-5 h-5 text-indigo-400" /> Goal Completion Analytics
              </h2>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                Real-time metric breakdown, category completion logs, and tracking maps.
              </p>
            </div>

            {/* Interactive SVG Chart block */}
            <div className={`p-4 rounded-2xl border ${isDarkMode ? 'glass bg-white/3 border-white/5' : 'bg-slate-50/50'}`}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-slate-400 uppercase">Interactive Weekly Progress Rate</span>
                <span className="text-[11px] font-sans text-indigo-400 font-semibold flex items-center gap-1 neon-text">
                  <TrendingUp className="w-3.5 h-3.5" /> Progression Index
                </span>
              </div>

              {/* Draw a gorgeous SVG Line graph */}
              <div className="h-44 w-full">
                <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  <line x1="0" y1="30" x2="500" y2="30" className={isDarkMode ? 'stroke-white/5' : 'stroke-slate-200'} strokeDasharray="5,5" />
                  <line x1="0" y1="75" x2="500" y2="75" className={isDarkMode ? 'stroke-white/5' : 'stroke-slate-200'} strokeDasharray="5,5" />
                  <line x1="0" y1="120" x2="500" y2="120" className={isDarkMode ? 'stroke-white/5' : 'stroke-slate-200'} strokeDasharray="5,5" />

                  {/* Curved Line or points */}
                  {roadmap ? (
                    <>
                      {/* Active curve - interpolates based on completion status */}
                      <path
                        d={`M 10,140 Q 100,${140 - (milestonesPercent * 0.4)} 250,${140 - (progressPercent * 0.9)} 490,${140 - (stats.achievementScore * 1.2)}`}
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                      <path
                        d={`M 10,140 Q 100,${140 - (milestonesPercent * 0.4)} 250,${140 - (progressPercent * 0.9)} 490,${140 - (stats.achievementScore * 1.2)} L 490,140 L 10,140 Z`}
                        fill="url(#chartGrad)"
                      />
                      
                      {/* Plot points */}
                      <circle cx="10" cy="140" r="5" fill="#a855f7" stroke="#030712" strokeWidth="1.5" />
                      <circle cx="250" cy={140 - (progressPercent * 0.9)} r="5" fill="#6366f1" stroke="#030712" strokeWidth="1.5" />
                      <circle cx="490" cy={140 - (stats.achievementScore * 1.2)} r="5" fill="#ec4899" stroke="#030712" strokeWidth="1.5" />
                    </>
                  ) : (
                    <>
                      {/* Empty State Baseline */}
                      <line x1="10" y1="140" x2="490" y2="140" stroke={isDarkMode ? 'rgba(255,255,255,0.08)' : '#cbd5e1'} strokeWidth="2" strokeDasharray="3,3" />
                      <circle cx="10" cy="140" r="4" fill="#64748b" />
                      <circle cx="130" cy="140" r="4" fill="#64748b" />
                      <circle cx="250" cy="140" r="4" fill="#64748b" />
                      <circle cx="370" cy="140" r="4" fill="#64748b" />
                      <circle cx="490" cy="140" r="4" fill="#64748b" />
                    </>
                  )}
                </svg>
              </div>

              {/* Labels */}
              <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-2">
                <span>Start Point</span>
                <span>Milestone Stage</span>
                <span>Active Plan Progress</span>
                <span>Achievement Target</span>
              </div>
            </div>

            {/* Numerical breakdown boxes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className={`p-4 rounded-xl border text-center ${isDarkMode ? 'glass bg-white/3 border-white/5' : 'bg-white shadow-sm'}`}>
                <span className="text-[9px] font-mono uppercase text-slate-400">Total Tasks</span>
                <span className={`block font-display text-lg font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.totalTasksCount}
                </span>
              </div>
              <div className={`p-4 rounded-xl border text-center ${isDarkMode ? 'glass bg-white/3 border-white/5' : 'bg-white shadow-sm'}`}>
                <span className="text-[9px] font-mono uppercase text-slate-400">Tasks Completed</span>
                <span className={`block font-display text-lg font-bold mt-1 text-emerald-400`}>
                  {stats.completedTasksCount}
                </span>
              </div>
              <div className={`p-4 rounded-xl border text-center ${isDarkMode ? 'glass bg-white/3 border-white/5' : 'bg-white shadow-sm'}`}>
                <span className="text-[9px] font-mono uppercase text-slate-400">Milestones Done</span>
                <span className={`block font-display text-lg font-bold mt-1 text-indigo-400 neon-text`}>
                  {stats.completedMilestonesCount}
                </span>
              </div>
              <div className={`p-4 rounded-xl border text-center ${isDarkMode ? 'glass bg-white/3 border-white/5' : 'bg-white shadow-sm'}`}>
                <span className="text-[9px] font-mono uppercase text-slate-400">Conversion Index</span>
                <span className={`block font-display text-lg font-bold mt-1 text-purple-400`}>
                  {progressPercent}%
                </span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
