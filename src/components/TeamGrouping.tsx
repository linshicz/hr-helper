import React, { useState } from 'react';
import {
  Users,
  Shuffle,
  Crown,
  Download,
  Copy,
  Check,
  Edit2,
  MoveRight,
  Sparkles,
  Sliders,
  Layers,
  ArrowRightLeft
} from 'lucide-react';
import { Participant, GroupConfig, GroupResult, GroupMode, GroupNamingStyle } from '../types/index.ts';
import { generateGroups, shuffleArray } from '../utils/grouping.ts';
import { exportGroupsToCSV, formatGroupsAsMarkdown } from '../utils/exporter.ts';
import { soundManager } from '../utils/audio.ts';
import { fireConfetti } from '../utils/confetti.ts';

interface TeamGroupingProps {
  participants: Participant[];
  groups: GroupResult[];
  setGroups: React.Dispatch<React.SetStateAction<GroupResult[]>>;
  onGoToRoster: () => void;
}

export const TeamGrouping: React.FC<TeamGroupingProps> = ({
  participants,
  groups,
  setGroups,
  onGoToRoster
}) => {
  const eligibleParticipants = participants.filter(p => p.isEligible);
  const totalEligible = eligibleParticipants.length;

  const [config, setConfig] = useState<GroupConfig>({
    mode: 'groupCount',
    groupCount: Math.min(4, Math.max(2, Math.floor(totalEligible / 4) || 2)),
    memberLimit: 5,
    balanceDepartment: true,
    assignLeader: true,
    namingStyle: 'energy'
  });

  const [copied, setCopied] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState('');
  const [movingMember, setMovingMember] = useState<{ member: Participant; sourceGroupId: string } | null>(null);

  // Group generation handler
  const handleGenerateGroups = () => {
    if (totalEligible === 0) return;
    soundManager.playPop();
    const result = generateGroups(eligibleParticipants, config);
    setGroups(result);
    soundManager.playWinnerFanfare();
    fireConfetti(2000);
  };

  const handleCopyMarkdown = () => {
    if (groups.length === 0) return;
    const text = formatGroupsAsMarkdown(groups);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      soundManager.playClick();
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleStartRenameGroup = (group: GroupResult) => {
    setEditingGroupId(group.id);
    setEditingGroupName(group.name);
  };

  const handleSaveRenameGroup = (groupId: string) => {
    if (!editingGroupName.trim()) {
      setEditingGroupId(null);
      return;
    }
    setGroups(prev =>
      prev.map(g => (g.id === groupId ? { ...g, name: editingGroupName.trim() } : g))
    );
    setEditingGroupId(null);
    soundManager.playClick();
  };

  const handleToggleLeader = (groupId: string, memberId: string) => {
    setGroups(prev =>
      prev.map(g => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          leaderId: g.leaderId === memberId ? undefined : memberId
        };
      })
    );
    soundManager.playClick();
  };

  const handleMoveMemberToGroup = (targetGroupId: string) => {
    if (!movingMember || movingMember.sourceGroupId === targetGroupId) {
      setMovingMember(null);
      return;
    }

    setGroups(prev => {
      return prev.map(g => {
        if (g.id === movingMember.sourceGroupId) {
          return {
            ...g,
            members: g.members.filter(m => m.id !== movingMember.member.id),
            leaderId: g.leaderId === movingMember.member.id ? undefined : g.leaderId
          };
        }
        if (g.id === targetGroupId) {
          return {
            ...g,
            members: [...g.members, movingMember.member]
          };
        }
        return g;
      });
    });

    soundManager.playPop();
    setMovingMember(null);
  };

  if (participants.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
        <Users className="w-12 h-12 mx-auto text-indigo-400 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">名单库尚无参与人员</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          请先前往名单库添加或导入名单，即可使用智能随机分组功能。
        </p>
        <button
          onClick={onGoToRoster}
          className="mt-6 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
        >
          前往名单库载入
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Configuration & Parameter Setup Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>智能分组配置参数</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              就绪参与人数：<span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">{totalEligible}</span> 人。支持按组数或人数上限智能平衡拆分。
            </p>
          </div>

          <button
            onClick={handleGenerateGroups}
            disabled={totalEligible === 0}
            className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-md shadow-indigo-600/20 rounded-xl transition-all whitespace-nowrap"
          >
            <Shuffle className="w-4 h-4" />
            <span>{groups.length > 0 ? '重新随机洗牌分组' : '立即生成随机分组'}</span>
          </button>
        </div>

        {/* Setting Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-2 border-t border-slate-100 dark:border-slate-800">
          {/* Mode 1: Grouping mode selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              分组计算模式
            </label>
            <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
              <button
                type="button"
                onClick={() => setConfig(prev => ({ ...prev, mode: 'groupCount' }))}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  config.mode === 'groupCount'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                按指定组数
              </button>
              <button
                type="button"
                onClick={() => setConfig(prev => ({ ...prev, mode: 'memberLimit' }))}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  config.mode === 'memberLimit'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                按每组人数上限
              </button>
            </div>
          </div>

          {/* Dynamic parameter slider/input depending on mode */}
          {config.mode === 'groupCount' ? (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  划分目标组数
                </label>
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                  {config.groupCount} 组 (约 {Math.round(totalEligible / config.groupCount)} 人/组)
                </span>
              </div>
              <input
                type="range"
                min="2"
                max={Math.max(2, Math.min(20, totalEligible))}
                value={config.groupCount}
                onChange={e => setConfig(prev => ({ ...prev, groupCount: parseInt(e.target.value) || 2 }))}
                className="w-full accent-indigo-600"
              />
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  每组成员上限
                </label>
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                  ≤ {config.memberLimit} 人/组 (预计 {Math.ceil(totalEligible / config.memberLimit)} 组)
                </span>
              </div>
              <input
                type="range"
                min="2"
                max={Math.max(2, Math.min(15, totalEligible))}
                value={config.memberLimit}
                onChange={e => setConfig(prev => ({ ...prev, memberLimit: parseInt(e.target.value) || 2 }))}
                className="w-full accent-indigo-600"
              />
            </div>
          )}

          {/* Group Naming Style */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              队名命名风格
            </label>
            <select
              value={config.namingStyle}
              onChange={e => setConfig(prev => ({ ...prev, namingStyle: e.target.value as GroupNamingStyle }))}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="energy">活力战队 (乘风破浪、极客先锋...)</option>
              <option value="numbers">标准序号 (第 1 组、第 2 组...)</option>
              <option value="colors">经典战色 (烈火红队、深邃蓝队...)</option>
              <option value="elements">东方神象 (青龙腾云、白虎疾风...)</option>
            </select>
          </div>

          {/* Smart Balance & Leader Toggles */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={config.balanceDepartment}
                onChange={e => setConfig(prev => ({ ...prev, balanceDepartment: e.target.checked }))}
                className="rounded accent-indigo-600 w-4 h-4"
              />
              <span>部门均衡混排 (打破部门壁垒)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={config.assignLeader}
                onChange={e => setConfig(prev => ({ ...prev, assignLeader: e.target.checked }))}
                className="rounded accent-indigo-600 w-4 h-4"
              />
              <span>每组随机指定 1 名组长 (👑)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Moving Member Helper Drawer if active */}
      {movingMember && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl p-4 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-3">
            <ArrowRightLeft className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <div className="text-xs text-amber-900 dark:text-amber-200">
              正在移动成员 <span className="font-bold underline">{movingMember.member.name}</span>，请点击下方目标卡片顶部的「移入此组」按钮完成调整。
            </div>
          </div>
          <button
            onClick={() => setMovingMember(null)}
            className="px-3 py-1 text-xs font-medium text-amber-800 dark:text-amber-300 hover:bg-amber-100 rounded"
          >
            取消移动
          </button>
        </div>
      )}

      {/* Grouping Results Board */}
      {groups.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-14 text-center">
          <Layers className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
            暂未生成分组
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            调整上方参数后，点击「立即生成随机分组」即可查看分组阵列卡片。
          </p>
          <button
            onClick={handleGenerateGroups}
            className="mt-4 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>一键生成分组</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Action strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-1">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              已生成 <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">{groups.length}</span> 个小组 · 共分配 <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">{groups.reduce((acc, g) => acc + g.members.length, 0)}</span> 名成员
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyMarkdown}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '已复制结果文本' : '复制群聊通告文本'}</span>
              </button>

              <button
                onClick={() => exportGroupsToCSV(groups)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>导出分组 CSV 表格</span>
              </button>
            </div>
          </div>

          {/* Responsive Teams Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {groups.map((group, groupIdx) => (
              <div
                key={group.id}
                className={`bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden transition-all flex flex-col justify-between ${
                  movingMember && movingMember.sourceGroupId !== group.id
                    ? 'ring-2 ring-amber-400 border-amber-300'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                {/* Group Header */}
                <div>
                  <div className="p-4 bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    {editingGroupId === group.id ? (
                      <div className="flex items-center gap-1 w-full">
                        <input
                          type="text"
                          value={editingGroupName}
                          onChange={e => setEditingGroupName(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleSaveRenameGroup(group.id)}
                          className="px-2 py-1 text-xs font-bold rounded bg-white dark:bg-slate-700 border border-indigo-500 w-full"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveRenameGroup(group.id)}
                          className="px-2 py-1 bg-indigo-600 text-white text-xs rounded"
                        >
                          存
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                            {groupIdx + 1}
                          </span>
                          <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                            {group.name}
                          </span>
                          <button
                            onClick={() => handleStartRenameGroup(group)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5"
                            title="修改队名"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 shrink-0">
                          {group.members.length} 人
                        </span>
                      </>
                    )}
                  </div>

                  {/* Target button for moving member */}
                  {movingMember && movingMember.sourceGroupId !== group.id && (
                    <button
                      onClick={() => handleMoveMemberToGroup(group.id)}
                      className="w-full py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center gap-1 transition-colors"
                    >
                      <MoveRight className="w-3 h-3" />
                      <span>移入本组</span>
                    </button>
                  )}

                  {/* Members list */}
                  <div className="p-3 divide-y divide-slate-100 dark:divide-slate-800/80">
                    {group.members.map((member) => {
                      const isLeader = group.leaderId === member.id;
                      return (
                        <div
                          key={member.id}
                          className="py-2 flex items-center justify-between group/row"
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <span
                              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                              style={{ backgroundColor: member.avatarColor }}
                            >
                              {member.name.slice(0, 1)}
                            </span>
                            <div className="truncate">
                              <div className="text-xs font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                                <span>{member.name}</span>
                                {isLeader && (
                                  <span
                                    title="本组组长"
                                    className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1 py-0.2 rounded"
                                  >
                                    <Crown className="w-3 h-3 text-amber-500" />
                                    <span>组长</span>
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                {member.department || '通用'}
                              </div>
                            </div>
                          </div>

                          {/* Inline adjustments */}
                          <div className="flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleToggleLeader(group.id, member.id)}
                              title={isLeader ? '取消组长' : '设为组长'}
                              className={`p-1 rounded text-slate-400 hover:text-amber-500 ${isLeader ? 'text-amber-500' : ''}`}
                            >
                              <Crown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setMovingMember({ member, sourceGroupId: group.id })}
                              title="调动至其他组"
                              className="p-1 rounded text-slate-400 hover:text-indigo-600"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Card footer info */}
                <div className="px-4 py-2 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>
                    部门数: {new Set(group.members.map(m => m.department)).size} 个
                  </span>
                  <span className="font-mono text-[10px]">
                    {group.leaderId ? '已选出组长' : '未指定组长'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
