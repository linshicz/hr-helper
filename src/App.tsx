import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { RosterManager } from './components/RosterManager.tsx';
import { LotteryDraw } from './components/LotteryDraw.tsx';
import { TeamGrouping } from './components/TeamGrouping.tsx';
import { Participant, Prize, WinnerRecord, GroupResult } from './types/index.ts';
import { PRESET_ROSTERS, INITIAL_PRIZES, createParticipant } from './data/presets.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<'roster' | 'lottery' | 'grouping'>('roster');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isDark, setIsDark] = useState<boolean>(false);

  // Initialize with the 50-person Gala roster by default so the user immediately sees a working system
  const [participants, setParticipants] = useState<Participant[]>(() => {
    try {
      const saved = localStorage.getItem('hr_participants_cache');
      if (saved) return JSON.parse(saved);
    } catch {}
    return PRESET_ROSTERS.annualGala50.data.map(item =>
      createParticipant(item.name, item.department, (item as { employeeId?: string }).employeeId)
    );
  });

  const [prizes, setPrizes] = useState<Prize[]>(() => {
    try {
      const saved = localStorage.getItem('hr_prizes_cache');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_PRIZES;
  });

  const [winners, setWinners] = useState<WinnerRecord[]>(() => {
    try {
      const saved = localStorage.getItem('hr_winners_cache');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [groups, setGroups] = useState<GroupResult[]>(() => {
    try {
      const saved = localStorage.getItem('hr_groups_cache');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Persist state in localStorage for convenience
  useEffect(() => {
    try {
      localStorage.setItem('hr_participants_cache', JSON.stringify(participants));
    } catch {}
  }, [participants]);

  useEffect(() => {
    try {
      localStorage.setItem('hr_prizes_cache', JSON.stringify(prizes));
    } catch {}
  }, [prizes]);

  useEffect(() => {
    try {
      localStorage.setItem('hr_winners_cache', JSON.stringify(winners));
    } catch {}
  }, [winners]);

  useEffect(() => {
    try {
      localStorage.setItem('hr_groups_cache', JSON.stringify(groups));
    } catch {}
  }, [groups]);

  // Sync dark theme class on document element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const eligibleCount = participants.filter(p => p.isEligible).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        isDark={isDark}
        setIsDark={setIsDark}
        participantCount={participants.length}
        eligibleCount={eligibleCount}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'roster' && (
          <RosterManager
            participants={participants}
            setParticipants={setParticipants}
            onNavigateToLottery={() => setActiveTab('lottery')}
            onNavigateToGrouping={() => setActiveTab('grouping')}
          />
        )}

        {activeTab === 'lottery' && (
          <LotteryDraw
            participants={participants}
            winners={winners}
            setWinners={setWinners}
            prizes={prizes}
            setPrizes={setPrizes}
            onGoToRoster={() => setActiveTab('roster')}
          />
        )}

        {activeTab === 'grouping' && (
          <TeamGrouping
            participants={participants}
            groups={groups}
            setGroups={setGroups}
            onGoToRoster={() => setActiveTab('roster')}
          />
        )}
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800/80 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200">HR 灵动助手</span>
            <span>·</span>
            <span>专为HR、行政及团队管理者打造的活动年会抽奖与随机分组工具</span>
          </div>
          <div className="flex items-center gap-4">
            <span>数据仅保存在浏览器本地，安全私密</span>
            <span>·</span>
            <button
              onClick={() => {
                if (window.confirm('重置为全新状态（包含默认名单与奖项）？')) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline"
            >
              重置全部数据
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
