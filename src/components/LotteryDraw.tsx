import React, { useState, useEffect, useRef } from 'react';
import {
  Gift,
  Trophy,
  RotateCcw,
  Maximize2,
  Minimize2,
  Download,
  Trash2,
  Plus,
  RefreshCw,
  Sparkles,
  Award,
  Smartphone,
  Wind,
  Headphones,
  Coffee,
  Check,
  Volume2
} from 'lucide-react';
import { Participant, Prize, WinnerRecord } from '../types/index.ts';
import { INITIAL_PRIZES } from '../data/presets.ts';
import { soundManager } from '../utils/audio.ts';
import { fireConfetti } from '../utils/confetti.ts';
import { exportWinnersToCSV } from '../utils/exporter.ts';

interface LotteryDrawProps {
  participants: Participant[];
  winners: WinnerRecord[];
  setWinners: React.Dispatch<React.SetStateAction<WinnerRecord[]>>;
  prizes: Prize[];
  setPrizes: React.Dispatch<React.SetStateAction<Prize[]>>;
  onGoToRoster: () => void;
}

export const LotteryDraw: React.FC<LotteryDrawProps> = ({
  participants,
  winners,
  setWinners,
  prizes,
  setPrizes,
  onGoToRoster
}) => {
  // Config states
  const [allowRepeat, setAllowRepeat] = useState<boolean>(false);
  const [selectedPrizeId, setSelectedPrizeId] = useState<string>(prizes[0]?.id || '');
  const [batchCount, setBatchCount] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Drawing state
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [currentRollingNames, setCurrentRollingNames] = useState<string[]>(['等待抽奖开始']);
  const [latestWinners, setLatestWinners] = useState<Participant[]>([]);
  const [showWinnerModal, setShowWinnerModal] = useState<boolean>(false);

  // Prize editing modal
  const [showPrizeModal, setShowPrizeModal] = useState<boolean>(false);
  const [editingPrizeName, setEditingPrizeName] = useState('');
  const [editingPrizeCount, setEditingPrizeCount] = useState(1);
  const [editingPrizeDesc, setEditingPrizeDesc] = useState('');

  // Animation interval refs
  const rollIntervalRef = useRef<number | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const eligibleParticipants = participants.filter(p => p.isEligible);

  // Eligible pool calculation based on allowRepeat setting
  const alreadyWonIds = new Set(winners.map(w => w.participantId));
  const availablePool = allowRepeat
    ? eligibleParticipants
    : eligibleParticipants.filter(p => !alreadyWonIds.has(p.id));

  const currentPrize = prizes.find(p => p.id === selectedPrizeId) || prizes[0];

  // Calculate remaining count for each prize
  const getPrizeWonCount = (prizeId: string) => {
    return winners.filter(w => w.prizeId === prizeId).length;
  };

  const getPrizeRemainingCount = (prize: Prize) => {
    const won = getPrizeWonCount(prize.id);
    return Math.max(0, prize.count - won);
  };

  // Keyboard shortcut: Spacebar to trigger draw
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isRolling && !showPrizeModal && availablePool.length > 0) {
        // Prevent page scroll
        if ((e.target as HTMLElement)?.tagName !== 'INPUT' && (e.target as HTMLElement)?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          startDraw();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRolling, showPrizeModal, availablePool.length, batchCount, selectedPrizeId, allowRepeat]);

  // Cleanup rolling timer on unmount
  useEffect(() => {
    return () => {
      if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
    };
  }, []);

  const startDraw = () => {
    if (isRolling) return;
    if (availablePool.length === 0) {
      alert(allowRepeat ? '当前没有就绪名单！' : '所有成员均已中奖或名单为空！可在上方开启「允许重复中奖」或重置记录。');
      return;
    }

    const countToDraw = Math.min(batchCount, availablePool.length);
    if (countToDraw <= 0) return;

    setIsRolling(true);
    setShowWinnerModal(false);
    setLatestWinners([]);

    // Sound effect
    soundManager.playPop();

    // Prepare randomized pick
    const shuffledPool = [...availablePool].sort(() => Math.random() - 0.5);
    const chosenWinners = shuffledPool.slice(0, countToDraw);

    let speed = 40; // ms
    let elapsed = 0;
    const totalRollDuration = 2800; // 2.8 seconds dramatic roll

    const tickAudio = () => {
      soundManager.playTick(600 + Math.random() * 200);
    };

    const rollStep = () => {
      elapsed += speed;

      // Pick random names to display during animation
      const tempNames: string[] = [];
      for (let i = 0; i < countToDraw; i++) {
        const randIndex = Math.floor(Math.random() * availablePool.length);
        tempNames.push(availablePool[randIndex].name);
      }
      setCurrentRollingNames(tempNames);
      tickAudio();

      if (elapsed > totalRollDuration * 0.7) {
        speed += 25; // decelerate towards the end
      }

      if (elapsed >= totalRollDuration) {
        // Stop and declare winners!
        if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
        finishDraw(chosenWinners);
      } else {
        if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
        rollIntervalRef.current = window.setTimeout(rollStep, speed);
      }
    };

    rollIntervalRef.current = window.setTimeout(rollStep, speed);
  };

  const finishDraw = (chosen: Participant[]) => {
    setIsRolling(false);
    setCurrentRollingNames(chosen.map(c => c.name));
    setLatestWinners(chosen);
    setShowWinnerModal(true);

    // Fanfare and confetti
    soundManager.playWinnerFanfare();
    fireConfetti(3500);

    // Save to winner history
    const batchId = 'batch_' + Date.now();
    const newRecords: WinnerRecord[] = chosen.map(p => ({
      id: 'rec_' + Math.random().toString(36).substring(2, 9),
      participantId: p.id,
      participantName: p.name,
      department: p.department,
      prizeId: currentPrize?.id || 'unknown',
      prizeName: currentPrize?.name || '特别奖',
      timestamp: Date.now(),
      drawBatchId: batchId
    }));

    setWinners(prev => [...newRecords, ...prev]);
  };

  // Re-draw single winner (e.g. absent on stage)
  const handleRedraw = (recordId: string) => {
    const record = winners.find(w => w.id === recordId);
    if (!record) return;

    if (!window.confirm(`确定要为「${record.participantName}」重抽吗？原中奖记录将被替换。`)) {
      return;
    }

    // Candidate pool excluding current winners except if repeat allowed
    const remainingCandidates = allowRepeat
      ? eligibleParticipants.filter(p => p.id !== record.participantId)
      : eligibleParticipants.filter(p => !alreadyWonIds.has(p.id));

    if (remainingCandidates.length === 0) {
      alert('没有多余的可用候选人用于重抽！');
      return;
    }

    const substitute = remainingCandidates[Math.floor(Math.random() * remainingCandidates.length)];

    soundManager.playWinnerFanfare();
    fireConfetti(2000);

    setWinners(prev =>
      prev.map(w =>
        w.id === recordId
          ? {
              ...w,
              participantId: substitute.id,
              participantName: substitute.name,
              department: substitute.department,
              timestamp: Date.now()
            }
          : w
      )
    );
  };

  const handleClearHistory = () => {
    if (winners.length === 0) return;
    if (window.confirm('确定清空所有中奖记录吗？名单将重新恢复抽奖资格。')) {
      setWinners([]);
      soundManager.playPop();
    }
  };

  const handleAddPrize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPrizeName.trim()) return;

    const newPrize: Prize = {
      id: 'prize_' + Date.now(),
      name: editingPrizeName.trim(),
      count: Math.max(1, editingPrizeCount),
      iconName: 'Award',
      color: '#4F46E5',
      description: editingPrizeDesc.trim() || undefined
    };

    setPrizes(prev => [...prev, newPrize]);
    setSelectedPrizeId(newPrize.id);
    setShowPrizeModal(false);
    setEditingPrizeName('');
    setEditingPrizeCount(1);
    setEditingPrizeDesc('');
    soundManager.playPop();
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (stageRef.current?.requestFullscreen) {
        stageRef.current.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Icon mapping helper
  const renderPrizeIcon = (iconName: string, color: string) => {
    const props = { className: 'w-5 h-5', style: { color } };
    switch (iconName) {
      case 'Smartphone': return <Smartphone {...props} />;
      case 'Wind': return <Wind {...props} />;
      case 'Headphones': return <Headphones {...props} />;
      case 'Coffee': return <Coffee {...props} />;
      case 'Gift': return <Gift {...props} />;
      default: return <Award {...props} />;
    }
  };

  if (participants.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
        <Gift className="w-12 h-12 mx-auto text-indigo-400 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">名单库尚无参与人员</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          请先前往名单库上传 CSV 或粘贴员工姓名，或一键导入示例数据后再进行抽奖。
        </p>
        <button
          onClick={onGoToRoster}
          className="mt-6 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
        >
          立即前往名单库导入
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6" ref={stageRef}>
      {/* Top Controls & Configuration Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Left: Mode toggle (Repeat vs No Repeat) */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              抽奖规则:
            </span>
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => {
                  setAllowRepeat(false);
                  soundManager.playClick();
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  !allowRepeat
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                不可重复中奖 (推荐)
              </button>
              <button
                onClick={() => {
                  setAllowRepeat(true);
                  soundManager.playClick();
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  allowRepeat
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                允许重复中奖
              </button>
            </div>
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

          {/* Batch Draw Count Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">单次抽取人数:</span>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              {[1, 3, 5, 10].map(cnt => (
                <button
                  key={cnt}
                  onClick={() => {
                    setBatchCount(cnt);
                    soundManager.playClick();
                  }}
                  className={`px-2.5 py-1 text-xs font-mono font-medium rounded transition-colors ${
                    batchCount === cnt
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cnt}人
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Pool stats & Fullscreen CTA */}
        <div className="flex items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            当前可抽奖池：
            <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums ml-1">
              {availablePool.length}
            </span>
            <span className="mx-1">/</span>
            <span className="font-mono tabular-nums">{eligibleParticipants.length}人</span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isFullscreen ? '退出全屏' : '年会大屏投影模式'}</span>
          </button>
        </div>
      </div>

      {/* Prize Selector Tabs Strip */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        {prizes.map(p => {
          const remaining = getPrizeRemainingCount(p);
          const isSelected = p.id === (currentPrize?.id || '');
          return (
            <button
              key={p.id}
              onClick={() => {
                setSelectedPrizeId(p.id);
                soundManager.playClick();
              }}
              className={`p-3.5 rounded-2xl border transition-all text-left flex items-center gap-3 shrink-0 min-w-[200px] ${
                isSelected
                  ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
              }`}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${p.color}15` }}
              >
                {renderPrizeIcon(p.iconName, p.color)}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {p.name}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                  <span>剩余:</span>
                  <span className={`font-mono font-semibold ${remaining > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                    {remaining}
                  </span>
                  <span>/ 总量 {p.count}</span>
                </div>
              </div>
            </button>
          );
        })}

        <button
          onClick={() => setShowPrizeModal(true)}
          className="p-3.5 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 text-slate-500 dark:text-slate-400 hover:text-indigo-600 flex items-center justify-center gap-2 shrink-0 min-w-[140px] text-xs font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>添加自定义奖品</span>
        </button>
      </div>

      {/* Hero Lucky Draw Arena / Rolling Stage */}
      <div className={`relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-white shadow-2xl p-8 sm:p-14 text-center flex flex-col items-center justify-center min-h-[380px] ${isFullscreen ? 'h-full justify-center' : ''}`}>
        {/* Glow ambient background aura */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Current prize badge */}
        <div className="relative z-10 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-medium mb-6 text-indigo-200">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>正在抽取：</span>
          <span className="font-bold text-white">{currentPrize?.name}</span>
          <span className="text-white/60">·</span>
          <span>本次抽取 {batchCount} 人</span>
        </div>

        {/* Main Rolling Display */}
        <div className="relative z-10 my-4 max-w-4xl w-full">
          {batchCount === 1 ? (
            <div
              className={`text-4xl sm:text-6xl md:text-7xl font-black tracking-wider transition-transform duration-75 text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-amber-200 drop-shadow-[0_4px_24px_rgba(255,255,255,0.3)] ${
                isRolling ? 'scale-105 animate-slot-pulse' : 'scale-100'
              }`}
            >
              {currentRollingNames[0]}
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-4 py-2">
              {currentRollingNames.map((name, i) => (
                <div
                  key={i}
                  className={`px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-2xl sm:text-3xl font-bold transition-all ${
                    isRolling ? 'animate-slot-pulse' : ''
                  }`}
                >
                  {name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Button Strip */}
        <div className="relative z-10 mt-8 flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={startDraw}
            disabled={isRolling || availablePool.length === 0}
            className={`px-10 py-4 rounded-2xl text-lg font-bold shadow-xl transition-all flex items-center gap-3 ${
              isRolling
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : availablePool.length === 0
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white transform hover:scale-105 active:scale-95 shadow-orange-500/25 ring-4 ring-amber-400/20'
            }`}
          >
            {isRolling ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>正在高速摇奖中...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-200" />
                <span>{availablePool.length === 0 ? '奖池已空' : '开始抽奖 (按空格键)'}</span>
              </>
            )}
          </button>
        </div>

        <div className="relative z-10 mt-4 text-xs text-slate-400 flex items-center gap-3">
          <span>提示：直接敲击键盘「空格键 Space」可直接触发抽奖</span>
          <span>·</span>
          <span>当前规则: {allowRepeat ? '允许重复抽取' : '不重复抽取'}</span>
        </div>
      </div>

      {/* Winner Reveal Modal (Celebration View) */}
      {showWinnerModal && latestWinners.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl max-w-xl w-full p-8 shadow-2xl text-center text-white relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30">
              <Trophy className="w-8 h-8 text-white" />
            </div>

            <div className="text-xs uppercase tracking-widest text-amber-400 font-semibold mb-1">
              CONGRATULATIONS
            </div>
            <h3 className="text-2xl font-bold tracking-tight mb-2">
              恭喜以下幸运儿获得【{currentPrize?.name}】
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              好运常伴，前程似锦！结果已同步存入中奖档案中。
            </p>

            <div className="space-y-3 max-h-64 overflow-y-auto mb-6 pr-1">
              {latestWinners.map((winner, idx) => (
                <div
                  key={winner.id}
                  className="bg-white/10 border border-white/10 rounded-2xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </span>
                    <div className="text-left">
                      <div className="text-lg font-bold">{winner.name}</div>
                      <div className="text-xs text-slate-400">{winner.department || '通用部门'}</div>
                    </div>
                  </div>
                  <span className="text-xs text-amber-300 font-medium px-2 py-1 bg-amber-500/20 rounded-md">
                    中奖得主
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setShowWinnerModal(false);
                  soundManager.playClick();
                }}
                className="px-6 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-semibold text-sm transition-colors"
              >
                收起弹窗
              </button>
              <button
                onClick={() => {
                  setShowWinnerModal(false);
                  startDraw();
                }}
                disabled={availablePool.length === 0}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 font-semibold text-sm transition-colors text-white"
              >
                继续下一轮抽奖
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Winners History & Audit Record Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-colors">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>中奖历史记录 ({winners.length} 人次)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              记录所有获奖名单，支持重抽换人和导出获奖全名册。
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportWinnersToCSV(winners)}
              disabled={winners.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>导出中奖 CSV</span>
            </button>
            <button
              onClick={handleClearHistory}
              disabled={winners.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-30 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>重置记录</span>
            </button>
          </div>
        </div>

        {winners.length === 0 ? (
          <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm">
            暂无中奖记录，点击上方「开始抽奖」见证幸运时刻！
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 sticky top-0 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                <tr>
                  <th className="py-2.5 px-4 w-12 text-center">序号</th>
                  <th className="py-2.5 px-4">中奖姓名</th>
                  <th className="py-2.5 px-4">部门</th>
                  <th className="py-2.5 px-4">获得奖项</th>
                  <th className="py-2.5 px-4">抽取时间</th>
                  <th className="py-2.5 px-4 w-24 text-right">现场调整</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {winners.map((record, index) => (
                  <tr
                    key={record.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-2.5 px-4 text-center font-mono tabular-nums text-slate-400">
                      {index + 1}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">
                      {record.participantName}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                      {record.department || '-'}
                    </td>
                    <td className="py-2.5 px-4 font-medium text-indigo-600 dark:text-indigo-400">
                      {record.prizeName}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-400 text-[11px]">
                      {new Date(record.timestamp).toLocaleTimeString('zh-CN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => handleRedraw(record.id)}
                        title="如本人不在场，可重新随机替补中奖者"
                        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>重抽</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Prize Modal */}
      {showPrizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={handleAddPrize}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                添加自定义奖品
              </h3>
              <button
                type="button"
                onClick={() => setShowPrizeModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                奖品名称 *
              </label>
              <input
                type="text"
                required
                placeholder="例如：特等奖 · 华为 MatePad / 京东E卡"
                value={editingPrizeName}
                onChange={e => setEditingPrizeName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                奖品总数量 *
              </label>
              <input
                type="number"
                min="1"
                required
                value={editingPrizeCount}
                onChange={e => setEditingPrizeCount(parseInt(e.target.value) || 1)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                奖品描述/寄语 (选填)
              </label>
              <input
                type="text"
                placeholder="例如：心愿好礼，感谢为公司拼搏的你"
                value={editingPrizeDesc}
                onChange={e => setEditingPrizeDesc(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPrizeModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                保存奖项
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
