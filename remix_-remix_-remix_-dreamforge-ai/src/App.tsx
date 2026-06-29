import React, { useState, useEffect } from "react";
import { Sparkles, Compass, Moon, Sun, ShieldAlert, Layers, HelpCircle, ArrowRight, Bell, Check } from "lucide-react";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";
import { Roadmap, Task, Milestone, ChatMessage, UserStats } from "./types";
import ParticleBackground from "./components/ParticleBackground";
import ConfettiEffect from "./components/ConfettiEffect";

interface NotificationItem {
  id: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export default function App() {
  const [activeRoadmap, setActiveRoadmap] = useState<Roadmap | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [stats, setStats] = useState<UserStats>({
    achievementScore: 0,
    totalTasksCount: 0,
    completedTasksCount: 0,
    totalMilestonesCount: 0,
    completedMilestonesCount: 0,
    streakDays: 0,
  });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [view, setView] = useState<"landing" | "dashboard">("landing");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [backendConfigError, setBackendConfigError] = useState<string | null>(null);

  // Reminders and notifications state
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem("df_notifications");
      return saved ? JSON.parse(saved) : [
        { id: "init-1", text: "Welcome to DreamForge! Forge your first goal.", timestamp: "Just now", read: false }
      ];
    } catch {
      return [{ id: "init-1", text: "Welcome to DreamForge! Forge your first goal.", timestamp: "Just now", read: false }];
    }
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [confettiTriggerCount, setConfettiTriggerCount] = useState(0);

  const addNotification = (text: string) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  useEffect(() => {
    try {
      localStorage.setItem("df_notifications", JSON.stringify(notifications));
    } catch (e) { console.error(e); }
  }, [notifications]);

  // Animated messages while generating
  const loadingMessages = [
    "Synthesizing Goal Semantics...",
    "Calibrating Difficulty Metrics...",
    "Structuring Chronological Milestones...",
    "Populating Daily and Weekly Rituals...",
    "Instantiating Contextual AI Mentor Agent...",
    "DreamForge Systems Initialized!"
  ];

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const savedRoadmap = localStorage.getItem("df_roadmap");
      const savedTasks = localStorage.getItem("df_tasks");
      const savedMilestones = localStorage.getItem("df_milestones");
      const savedMessages = localStorage.getItem("df_chat");
      const savedStats = localStorage.getItem("df_stats");
      const savedTheme = localStorage.getItem("df_theme");

      if (savedRoadmap) setActiveRoadmap(JSON.parse(savedRoadmap));
      if (savedTasks) setTasks(JSON.parse(savedTasks));
      if (savedMilestones) setMilestones(JSON.parse(savedMilestones));
      if (savedMessages) setChatMessages(JSON.parse(savedMessages));
      if (savedStats) setStats(JSON.parse(savedStats));
      
      if (savedTheme === "light") {
        setIsDarkMode(false);
      } else {
        setIsDarkMode(true);
      }

      if (savedRoadmap) {
        setView("dashboard");
      }
    } catch (e) {
      console.error("Failed to load local storage state", e);
    }

    // Check if API Key is configured on backend
    fetch("/api/config-check")
      .then(res => res.json())
      .then(data => {
        if (!data.hasKey) {
          setBackendConfigError("GEMINI_API_KEY is not set. Please open Settings > Secrets to add your Gemini API Key.");
        }
      })
      .catch(err => {
        console.error("Config check failed", err);
      });
  }, []);

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    try {
      if (activeRoadmap) {
        localStorage.setItem("df_roadmap", JSON.stringify(activeRoadmap));
      } else {
        localStorage.removeItem("df_roadmap");
      }
    } catch (e) { console.error(e); }
  }, [activeRoadmap]);

  useEffect(() => {
    try {
      localStorage.setItem("df_tasks", JSON.stringify(tasks));
      localStorage.setItem("df_milestones", JSON.stringify(milestones));
    } catch (e) { console.error(e); }
  }, [tasks, milestones]);

  useEffect(() => {
    try {
      localStorage.setItem("df_chat", JSON.stringify(chatMessages));
    } catch (e) { console.error(e); }
  }, [chatMessages]);

  useEffect(() => {
    try {
      localStorage.setItem("df_stats", JSON.stringify(stats));
    } catch (e) { console.error(e); }
  }, [stats]);

  useEffect(() => {
    try {
      localStorage.setItem("df_theme", isDarkMode ? "dark" : "light");
    } catch (e) { console.error(e); }
  }, [isDarkMode]);

  // Loading indicator step rotation
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev + 1) % loadingMessages.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [isLoading]);

  // Recalculate stats dynamically whenever tasks or milestones update
  useEffect(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.isCompleted).length;
    const totalMilestones = milestones.length;
    const completedMilestones = milestones.filter(m => m.isCompleted).length;

    // Weights: 50% tasks completion, 50% milestones completion
    let achievementScore = 0;
    if (totalTasks > 0) {
      const taskWeight = (completedTasks / totalTasks) * 50;
      const milestoneWeight = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 50 : 0;
      achievementScore = Math.round(taskWeight + milestoneWeight);
    }

    // Set active streak (starts at 0, goes to 1 once they start interacting)
    const currentStreak = totalTasks > 0 ? (completedTasks > 0 ? 1 : 0) : 0;

    setStats({
      achievementScore,
      totalTasksCount: totalTasks,
      completedTasksCount: completedTasks,
      totalMilestonesCount: totalMilestones,
      completedMilestonesCount: completedMilestones,
      streakDays: stats.streakDays || currentStreak
    });
  }, [tasks, milestones]);

  // Toggle Task Completion State
  const handleToggleTask = (milestoneId: string, taskId: string) => {
    let taskCompletedJustNow = false;
    let milestoneCompletedJustNow = false;

    // 1. Update milestones tasks
    const updatedMilestones = milestones.map(m => {
      if (m.id === milestoneId) {
        const updatedMilTask = m.tasks.map(t => {
          if (t.id === taskId) {
            const nextCompleted = !t.isCompleted;
            if (nextCompleted) taskCompletedJustNow = true;
            return { ...t, isCompleted: nextCompleted };
          }
          return t;
        });
        const originallyCompleted = m.isCompleted;
        const allDone = updatedMilTask.length > 0 && updatedMilTask.every(t => t.isCompleted);
        if (allDone && !originallyCompleted) {
          milestoneCompletedJustNow = true;
        }
        return { ...m, tasks: updatedMilTask, isCompleted: allDone };
      }
      return m;
    });

    // 2. Update simple tasks list (including custom user-created tasks)
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        const nextCompleted = !t.isCompleted;
        if (nextCompleted && milestoneId === "custom") {
          taskCompletedJustNow = true;
        }
        return { ...t, isCompleted: nextCompleted };
      }
      return t;
    });

    if (taskCompletedJustNow || milestoneCompletedJustNow) {
      setConfettiTriggerCount(prev => prev + 1);
      if (milestoneCompletedJustNow) {
        addNotification("🏆 Milestone Achieved! You have unlocked a new phase of your goal progression.");
      } else {
        addNotification("🎯 Habit Logged: Successfully earned experience points (XP)!");
      }
    }

    setMilestones(updatedMilestones);
    setTasks(updatedTasks);
  };

  // Add a Custom Task
  const handleAddTask = (text: string, timeframe: "daily" | "weekly" | "monthly") => {
    const newTask: Task = {
      id: `custom-${Date.now()}`,
      text,
      isCompleted: false,
      timeframe
    };
    setTasks([newTask, ...tasks]);
  };

  // Delete a Custom Task
  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  // Submit Goal to AI Generator
  const handleForgeRoadmap = async (goal: string, difficulty: string, timeframe: string, mentorStyle: string) => {
    setIsLoading(true);
    setLoadingStep(0);
    try {
      const response = await fetch("/api/generate-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, difficulty, timeframe, mentorStyle }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to contact calibration service");
      }

      const roadmap: Roadmap = await response.json();
      
      // Initialize states with the brand new generated values!
      setActiveRoadmap(roadmap);

      // Extract milestones and initialize all tasks as uncompleted (0 stats)
      const allTasks: Task[] = [];
      const formattedMilestones = roadmap.milestones.map(m => {
        const mTasks = m.tasks.map(t => ({
          ...t,
          isCompleted: false // Starts at exactly 0 progress
        }));
        allTasks.push(...mTasks);
        return {
          ...m,
          tasks: mTasks,
          isCompleted: false
        };
      });

      setMilestones(formattedMilestones);
      setTasks(allTasks);

      // Trigger mentor introductory greeting
      const initGreeting: ChatMessage = {
        id: `m-init-${Date.now()}`,
        sender: "mentor",
        text: `Greetings, apprentice! I am your mentor, ${roadmap.mentorName}. I've synthesized your custom training roadmap for '${roadmap.goalName}'. It consists of ${roadmap.milestones.length} core milestones. Let's start by looking at Phase 1. Ask me any questions, and let's forge this dream together!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages([initGreeting]);

      // Set stats explicitly to 0 for a clean launch!
      setStats({
        achievementScore: 0,
        totalTasksCount: allTasks.length,
        completedTasksCount: 0,
        totalMilestonesCount: formattedMilestones.length,
        completedMilestonesCount: 0,
        streakDays: 0
      });

      setView("dashboard");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "DreamForge calibration system encountered a temporal anomaly. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Load standard Demo Empty State Board
  const handleLoadDemo = () => {
    setIsDemoLoading(true);
    setTimeout(() => {
      // Set everything explicitly to 0/empty state
      setActiveRoadmap(null);
      setMilestones([]);
      setTasks([]);
      setChatMessages([]);
      setStats({
        achievementScore: 0,
        totalTasksCount: 0,
        completedTasksCount: 0,
        totalMilestonesCount: 0,
        completedMilestonesCount: 0,
        streakDays: 0
      });
      setIsDemoLoading(false);
      setView("dashboard");
    }, 600);
  };

  // Chat conversation with personalized AI Mentor
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...chatMessages, userMsg];
    setChatMessages(newHistory);
    setIsLoading(true); // show thinking indicator in chat

    try {
      const response = await fetch("/api/mentor-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalName: activeRoadmap?.goalName || "their goal",
          mentorName: activeRoadmap?.mentorName || "AI Mentor",
          mentorPersonality: activeRoadmap?.mentorPersonality || "Strategic guide",
          messages: newHistory,
          currentProgress: stats.achievementScore,
          roadmap: activeRoadmap ? {
            ...activeRoadmap,
            milestones: milestones
          } : null
        }),
      });

      if (!response.ok) {
        let errMsg = "Mentor connection failed.";
        try {
          const errData = await response.json();
          if (errData && errData.error) errMsg = errData.error;
        } catch {}
        throw new Error(errMsg);
      }

      const data = await response.json();
      
      const mentorMsg: ChatMessage = {
        id: `m-${Date.now()}`,
        sender: "mentor",
        text: data.text || "I am reflecting on your response. Please expand on your thought.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages([...newHistory, mentorMsg]);
    } catch (err: any) {
      console.error(err);
      const errMsg: ChatMessage = {
        id: `m-err-${Date.now()}`,
        sender: "mentor",
        text: `The quantum mental link was briefly interrupted: ${err.message || "Unknown error"}. Please check your configuration and try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages([...newHistory, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 relative ${isDarkMode ? 'bg-[#05070A] text-slate-100 bg-radial-dark' : 'bg-slate-50 text-slate-800 bg-radial-light'}`}>
      
      {/* GLOBAL PARTICLE AND CONFETTI BACKGROUNDS */}
      <ParticleBackground isDarkMode={isDarkMode} />
      <ConfettiEffect triggerCount={confettiTriggerCount} />

      {/* HEADER SECTION */}
      <header className={`sticky top-0 z-40 w-full backdrop-blur-md border-b transition-all relative ${
        isDarkMode 
          ? 'bg-[#05070a]/70 border-white/8' 
          : 'bg-white/75 border-slate-200 shadow-xs'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div 
            onClick={() => setView("landing")} 
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 z-10"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight neon-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-400 bg-clip-text text-transparent uppercase">
              DreamForge
            </span>
          </div>

          <div className="flex items-center gap-3 z-10">
            {/* Nav Switcher */}
            {view === "dashboard" ? (
              <button
                onClick={() => setView("landing")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  isDarkMode 
                    ? 'glass glass-hover text-slate-300' 
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                Calibration Portal
              </button>
            ) : (
              <button
                onClick={() => setView("dashboard")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  isDarkMode 
                    ? 'glass glass-hover text-slate-300' 
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                View Dashboard
              </button>
            )}

            {/* Reminders & Notification Center */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 rounded-lg border transition-all cursor-pointer relative ${
                  isDarkMode 
                    ? 'border-white/8 bg-white/5 text-indigo-300 hover:bg-white/10' 
                    : 'border-slate-200 bg-white text-purple-600 hover:bg-gray-50'
                }`}
                aria-label="Notification Center"
              >
                <Bell className="w-4 h-4" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-pink-500 rounded-full animate-pulse border border-white"></span>
                )}
              </button>

              {showNotifications && (
                <div className={`absolute right-0 mt-2 w-80 rounded-2xl border p-4 shadow-xl z-50 animate-fadeIn ${
                  isDarkMode 
                    ? 'glass bg-[#080d1a] border-white/10 text-white' 
                    : 'bg-white border-slate-200 text-slate-800'
                }`}>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-300">Smart Reminders</h4>
                    <button 
                      onClick={() => {
                        setNotifications(notifications.map(n => ({ ...n, read: true })));
                      }}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 cursor-pointer"
                    >
                      Clear all
                    </button>
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-[11px] text-slate-400 text-center py-4">No active reminders.</p>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          className={`p-2 rounded-xl text-xs flex gap-2 items-start ${
                            notif.read ? 'opacity-65' : 'bg-indigo-500/5 border border-indigo-500/10'
                          }`}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="leading-tight text-[11px] font-sans break-words">{notif.text}</p>
                            <span className="text-[9px] text-slate-500 font-mono mt-1 block">{notif.timestamp}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dark/Light Mode Switcher */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                isDarkMode 
                  ? 'border-white/8 bg-white/5 text-indigo-300 hover:bg-white/10' 
                  : 'border-slate-200 bg-white text-purple-600 hover:bg-gray-50'
              }`}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* BACKEND CONFIG WARNING */}
      {backendConfigError && (
        <div className="bg-red-500/10 border-b border-red-500/20 py-2.5 px-4 text-center">
          <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 text-xs text-red-400 font-medium">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            {backendConfigError}
          </div>
        </div>
      )}

      {/* MAIN VIEW CONTROLLER */}
      <main className="pb-16">
        {isLoading && view === "landing" ? (
          /* Immersive Loading Screen */
          <div className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center text-center px-4">
            <div className="relative w-24 h-24 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 animate-pulse"></div>
              <div className="absolute inset-0 rounded-full border-t-4 border-cyan-400 animate-spin"></div>
            </div>
            
            <h2 className="font-display text-lg font-bold text-white mb-2 uppercase tracking-widest text-glow-cyan animate-pulse">
              CALIBRATING SYSTEM PARAMETERS
            </h2>
            <p className="text-xs font-mono text-purple-400 max-w-sm">
              {loadingMessages[loadingStep]}
            </p>
          </div>
        ) : view === "landing" ? (
          <LandingPage 
            onForge={handleForgeRoadmap} 
            isLoading={isLoading} 
            isDemoLoading={isDemoLoading} 
            onLoadDemo={handleLoadDemo}
            isDarkMode={isDarkMode}
          />
        ) : (
          <Dashboard
            roadmap={activeRoadmap}
            tasks={tasks}
            milestones={milestones}
            stats={stats}
            chatMessages={chatMessages}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
            onSendMessage={handleSendMessage}
            isChatLoading={isLoading}
            isDarkMode={isDarkMode}
            onNavigateToForge={() => setView("landing")}
          />
        )}
      </main>

    </div>
  );
}
