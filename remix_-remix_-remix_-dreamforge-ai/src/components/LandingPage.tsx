import React, { useState } from "react";
import { Sparkles, ArrowRight, Compass, Shield, Zap, RefreshCw, Cpu } from "lucide-react";

interface LandingPageProps {
  onForge: (goal: string, difficulty: string, timeframe: string, mentorStyle: string) => Promise<void>;
  isLoading: boolean;
  isDemoLoading: boolean;
  onLoadDemo: () => void;
  isDarkMode: boolean;
}

export default function LandingPage({ onForge, isLoading, isDemoLoading, onLoadDemo, isDarkMode }: LandingPageProps) {
  const [goal, setGoal] = useState("");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [timeframe, setTimeframe] = useState("8 Weeks");
  const [mentorStyle, setMentorStyle] = useState("Empathetic & Supportive");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;
    onForge(goal, difficulty, timeframe, mentorStyle);
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-4 py-12 md:py-16 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none"></div>

      {/* Hero Badge */}
      <div className="relative z-10 flex items-center gap-2 px-3.5 py-1.5 mb-6 rounded-full border text-xs font-mono tracking-wider uppercase glass glass-hover text-indigo-300 border-indigo-500/30 neon-text cursor-default">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
        Forge Your Potential
      </div>

      {/* Main Heading */}
      <h1 className="relative z-10 max-w-4xl text-center font-display text-5xl md:text-7xl font-bold tracking-tight mb-3 leading-tight">
        <span className="bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent neon-text">
          DreamForge AI
        </span>
      </h1>

      {/* Subtitle */}
      <p className={`relative z-10 max-w-3xl text-center font-display text-xl md:text-3xl font-medium tracking-tight mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Transform Your Goals into Smart AI-Powered Roadmaps
      </p>

      {/* Description */}
      <p className={`relative z-10 max-w-2xl text-center text-sm md:text-base font-sans mb-12 leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        DreamForge AI helps users plan, prioritize, and complete tasks before deadlines with personalized AI guidance.
      </p>

      {/* Calibration Form */}
      <div className="relative z-10 w-full max-w-2xl">
        <div className={`p-6 md:p-8 glass ${isDarkMode ? 'bg-white/3 border-white/8' : 'bg-white/80 border-slate-200 shadow-xl'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Cpu className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className={`font-display font-semibold text-lg ${isDarkMode ? 'text-white neon-text' : 'text-gray-900'}`}>
                Dream Calibration Engine
              </h2>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                Enter your goal and fine-tune your parameters to forge your experience.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Goal Input */}
            <div>
              <label className={`block text-xs font-mono uppercase tracking-wider mb-2 font-medium ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                What dream are you forging?
              </label>
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g., Become a self-taught Full-Stack Developer, Run a marathon in 6 months, Launch my first Indie SaaS startup, Learn classical piano..."
                className={`w-full h-28 px-4 py-3 rounded-2xl border font-sans text-sm outline-none resize-none transition-all ${
                  isDarkMode
                    ? "bg-white/5 border-white/8 text-white placeholder-slate-500 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20"
                    : "bg-white border-slate-200 text-gray-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                }`}
                disabled={isLoading}
                required
              />
            </div>

            {/* Grid of parameters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Difficulty */}
              <div>
                <label className={`block text-xs font-mono uppercase tracking-wider mb-2 font-medium ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                  Your Current Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-sans text-sm outline-none transition-all ${
                    isDarkMode
                      ? "bg-white/5 border-white/8 text-white focus:border-indigo-500/60"
                      : "bg-white border-slate-200 text-gray-900 focus:border-indigo-500"
                  }`}
                  disabled={isLoading}
                >
                  <option value="Beginner" className="bg-[#05070A]">Beginner (Zero experience)</option>
                  <option value="Intermediate" className="bg-[#05070A]">Intermediate (Some basics)</option>
                  <option value="Advanced" className="bg-[#05070A]">Advanced (Refining skill)</option>
                </select>
              </div>

              {/* Timeframe */}
              <div>
                <label className={`block text-xs font-mono uppercase tracking-wider mb-2 font-medium ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                  Target Duration
                </label>
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-sans text-sm outline-none transition-all ${
                    isDarkMode
                      ? "bg-white/5 border-white/8 text-white focus:border-indigo-500/60"
                      : "bg-white border-slate-200 text-gray-900 focus:border-indigo-500"
                  }`}
                  disabled={isLoading}
                >
                  <option value="4 Weeks" className="bg-[#05070A]">4 Weeks (Sprint)</option>
                  <option value="8 Weeks" className="bg-[#05070A]">8 Weeks (Standard)</option>
                  <option value="12 Weeks" className="bg-[#05070A]">12 Weeks (Quarterly)</option>
                  <option value="6 Months" className="bg-[#05070A]">6 Months (Deep journey)</option>
                  <option value="1 Year" className="bg-[#05070A]">1 Year (Long-term Mastery)</option>
                </select>
              </div>

              {/* Mentor personality */}
              <div>
                <label className={`block text-xs font-mono uppercase tracking-wider mb-2 font-medium ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                  Mentor Philosophy
                </label>
                <select
                  value={mentorStyle}
                  onChange={(e) => setMentorStyle(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-sans text-sm outline-none transition-all ${
                    isDarkMode
                      ? "bg-white/5 border-white/8 text-white focus:border-indigo-500/60"
                      : "bg-white border-slate-200 text-gray-900 focus:border-indigo-500"
                  }`}
                  disabled={isLoading}
                >
                  <option value="Empathetic & Supportive" className="bg-[#05070A]">Empathetic & Encouraging</option>
                  <option value="No-Nonsense & Disciplined" className="bg-[#05070A]">No-Nonsense & Disciplined</option>
                  <option value="Philosophical & Strategic" className="bg-[#05070A]">Philosophical & Strategic</option>
                  <option value="Practical & Action-Focused" className="bg-[#05070A]">Practical & Action-Focused</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={isLoading || !goal.trim()}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-display text-sm font-bold tracking-wider text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-102 hover:opacity-95 shadow-lg shadow-indigo-600/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    FORGING SYSTEMS...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    FORGE ROADMAP
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onLoadDemo}
                disabled={isLoading || isDemoLoading}
                className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-display text-sm font-semibold tracking-wider border cursor-pointer transition-all ${
                  isDarkMode
                    ? "glass glass-hover text-slate-300"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                {isDemoLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    LOADING...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-indigo-400" />
                    EXPLORE EMPTY STATS
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Feature grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mt-16 md:mt-24">
        {/* Feature 1 */}
        <div className={`p-5 rounded-2xl transition-all ${isDarkMode ? 'glass glass-hover' : 'bg-white border-slate-100 shadow-sm hover:border-cyan-300'}`}>
          <div className="p-2.5 w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className={`font-display font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Milestone Progression
          </h3>
          <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
            Chronological stages broken down from beginner level to master targets, mapping skills automatically.
          </p>
        </div>

        {/* Feature 2 */}
        <div className={`p-5 rounded-2xl transition-all ${isDarkMode ? 'glass glass-hover' : 'bg-white border-slate-100 shadow-sm hover:border-purple-300'}`}>
          <div className="p-2.5 w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className={`font-display font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Daily & Weekly Rituals
          </h3>
          <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
            Dynamic task scheduler that matches your pacing so you know exactly what is on the agenda today.
          </p>
        </div>

        {/* Feature 3 */}
        <div className={`p-5 rounded-2xl transition-all ${isDarkMode ? 'glass glass-hover' : 'bg-white border-slate-100 shadow-sm hover:border-pink-300'}`}>
          <div className="p-2.5 w-10 h-10 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center mb-4">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className={`font-display font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Dedicated AI Mentorship
          </h3>
          <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
            Chat with a tailored subject-matter advisor, loaded with custom coaching instructions specific to your goal.
          </p>
        </div>
      </div>
    </div>
  );
}
