import React from 'react';
import { Volume2, VolumeX, Moon, Sun, Users, Gift, Split } from 'lucide-react';
import { soundManager } from '../utils/audio.ts';

interface NavbarProps {
  activeTab: 'roster' | 'lottery' | 'grouping';
  setActiveTab: (tab: 'roster' | 'lottery' | 'grouping') => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  participantCount: number;
  eligibleCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  soundEnabled,
  setSoundEnabled,
  isDark,
  setIsDark,
  eligibleCount,
}) => {
  const toggleSound = () => {
    const next = !soundEnabled;
    soundManager.enabled = next;
    setSoundEnabled(next);
    if (next) soundManager.playPop();
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm font-bold text-lg">
            HR
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
            HR 灵动助手
          </span>
        </div>

        {/* Zone 2: Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
          <button
            onClick={() => {
              setActiveTab('roster');
              soundManager.playClick();
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'roster'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>名单库</span>
            <span className="text-xs px-1.5 py-0.2 font-mono tabular-nums bg-slate-200 dark:bg-slate-600 rounded text-slate-700 dark:text-slate-300">
              {eligibleCount}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('lottery');
              soundManager.playClick();
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'lottery'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>奖品抽签</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('grouping');
              soundManager.playClick();
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'grouping'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Split className="w-4 h-4" />
            <span>智能随机分组</span>
          </button>
        </nav>

        {/* Zone 3: Functional controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggleSound}
            title={soundEnabled ? '音效开启' : '音效静音'}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          <button
            onClick={toggleTheme}
            title={isDark ? '切换浅色模式' : '切换深色模式'}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
