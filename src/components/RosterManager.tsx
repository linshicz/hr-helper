import React, { useState, useRef } from 'react';
import {
  Upload,
  ClipboardList,
  Sparkles,
  Download,
  Trash2,
  Shuffle,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Participant } from '../types/index.ts';
import {
  PRESET_ROSTERS,
  createParticipant,
  parseParticipantsFromText
} from '../data/presets.ts';
import { exportRosterToCSV, downloadCSV } from '../utils/exporter.ts';
import { soundManager } from '../utils/audio.ts';

interface RosterManagerProps {
  participants: Participant[];
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
  onNavigateToLottery: () => void;
  onNavigateToGrouping: () => void;
}

export const RosterManager: React.FC<RosterManagerProps> = ({
  participants,
  setParticipants,
  onNavigateToLottery,
  onNavigateToGrouping
}) => {
  const [pasteText, setPasteText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [showPresetsModal, setShowPresetsModal] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Single add form
  const [newName, setNewName] = useState('');
  const [newDept, setNewDept] = useState('');
  const [newId, setNewId] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3200);
  };

  // Distinct departments
  const departments = Array.from(new Set(participants.map(p => p.department || '通用'))).filter(Boolean);

  const eligibleCount = participants.filter(p => p.isEligible).length;

  const handleApplyPaste = () => {
    if (!pasteText.trim()) return;
    const parsed = parseParticipantsFromText(pasteText);
    if (parsed.length === 0) {
      showToast('未检测到有效姓名，请检查输入格式', 'error');
      return;
    }

    setParticipants(prev => {
      // Deduplicate against existing by name
      const existingNames = new Set(prev.map(p => p.name));
      const newItems = parsed.filter(p => !existingNames.has(p.name));
      return [...prev, ...newItems];
    });

    soundManager.playPop();
    showToast(`成功解析并添加 ${parsed.length} 名成员`, 'success');
    setPasteText('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const parsed = parseParticipantsFromText(text);
        if (parsed.length > 0) {
          setParticipants(parsed);
          soundManager.playPop();
          showToast(`已从文件成功载入 ${parsed.length} 名成员`, 'success');
        } else {
          showToast('无法解析此文件内容，请使用标准CSV或文本', 'error');
        }
      }
    };
    reader.readAsText(file, 'utf-8');
    if (e.target) e.target.value = '';
  };

  const handleLoadPreset = (key: keyof typeof PRESET_ROSTERS) => {
    const preset = PRESET_ROSTERS[key];
    const newParticipants: Participant[] = preset.data.map(item =>
      createParticipant(item.name, item.department, (item as { employeeId?: string }).employeeId)
    );
    setParticipants(newParticipants);
    setShowPresetsModal(false);
    soundManager.playWinnerFanfare();
    showToast(`已加载「${preset.title}」共 ${newParticipants.length} 人`, 'success');
  };

  const handleToggleEligible = (id: string) => {
    soundManager.playClick();
    setParticipants(prev =>
      prev.map(p => (p.id === id ? { ...p, isEligible: !p.isEligible } : p))
    );
  };

  const handleDeleteParticipant = (id: string) => {
    soundManager.playClick();
    setParticipants(prev => prev.filter(p => p.id !== id));
  };

  const handleToggleAll = (status: boolean) => {
    soundManager.playClick();
    setParticipants(prev => prev.map(p => ({ ...p, isEligible: status })));
    showToast(status ? '已全选参与资格' : '已全部暂停资格', 'info');
  };

  const handleShuffleList = () => {
    soundManager.playPop();
    setParticipants(prev => [...prev].sort(() => Math.random() - 0.5));
    showToast('名单已随机打乱重排', 'info');
  };

  const handleDeduplicate = () => {
    const seen = new Set<string>();
    const unique: Participant[] = [];
    let dupsCount = 0;

    for (const p of participants) {
      if (seen.has(p.name)) {
        dupsCount++;
      } else {
        seen.add(p.name);
        unique.push(p);
      }
    }

    if (dupsCount > 0) {
      setParticipants(unique);
      soundManager.playPop();
      showToast(`已清理 ${dupsCount} 条重名记录`, 'success');
    } else {
      showToast('当前名单无重复姓名', 'info');
    }
  };

  const handleAddSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const participant = createParticipant(newName, newDept, newId);
    setParticipants(prev => [participant, ...prev]);
    soundManager.playPop();
    setNewName('');
    setNewDept('');
    setNewId('');
    showToast(`已添加「${participant.name}」`, 'success');
  };

  const handleDownloadTemplate = () => {
    const sample = '姓名,部门,工号\n张三,技术研发部,RD001\n李四,市场商务部,MK002\n王五,产品设计部,PD003\n赵六,人力行政部,HR004';
    downloadCSV('HR名单导入模板.csv', sample);
    showToast('模板已下载', 'info');
  };

  // Filtered view
  const filteredParticipants = participants.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.department && p.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.employeeId && p.employeeId.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDept = selectedDept === 'all' || p.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg bg-slate-900 text-white text-sm font-medium transition-transform animate-in fade-in slide-in-from-bottom-2">
          {notification.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Banner / Hero Metric Strip */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              HR 员工名单管理中心
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              通过贴上姓名或上传 CSV 表格构建名单，支持一键载入年会与拓展破冰模板。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowPresetsModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-colors whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" />
              <span>载入名单示例</span>
            </button>

            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
            >
              <FileText className="w-4 h-4" />
              <span>下载标准模板</span>
            </button>

            <button
              onClick={() => exportRosterToCSV(participants)}
              disabled={participants.length === 0}
              className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 rounded-lg transition-colors whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>导出名单 CSV</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/80">
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">名单总人数</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
              {participants.length}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">符合资格/就绪</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
              {eligibleCount}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">覆盖部门数</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
              {departments.length}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-rose-500 dark:text-rose-400">已暂停/缺席</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-rose-500 dark:text-rose-400 mt-1">
              {participants.length - eligibleCount}
            </div>
          </div>
        </div>
      </div>

      {/* Input Methods: Two Column Setup */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Fast Text Paste */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ClipboardList className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                直接贴上姓名名单
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              支持直接粘贴 Excel 或文档多行文本。格式如：<code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-300">姓名</code> 或 <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-300">姓名,部门</code> 或 <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-300">姓名(部门)</code>
            </p>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="例：&#10;张三 技术研发部&#10;李四 市场部&#10;王五 产品设计部&#10;赵六(人力资源部)"
              rows={5}
              className="w-full text-sm font-mono p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {pasteText ? `已输入约 ${pasteText.split('\n').filter(Boolean).length} 行` : '等待粘贴内容'}
            </span>
            <button
              onClick={handleApplyPaste}
              disabled={!pasteText.trim()}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 rounded-lg transition-colors"
            >
              追加解析导入
            </button>
          </div>
        </div>

        {/* Card 2: CSV Upload & Quick Add */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Upload className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                上传 CSV / 表格文件
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              支持上传带有姓名、部门列的 CSV 文件，自动编码解析。
            </p>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv,.txt"
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-xl p-5 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/20"
            >
              <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                点击选择或拖拽 CSV 文件至此处
              </p>
              <p className="text-xs text-slate-400 mt-1">支持 .csv 与 .txt 纯文本编码</p>
            </div>
          </div>

          {/* Quick single member inline add */}
          <form onSubmit={handleAddSingle} className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">手动单条添加成员</div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="姓名*"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-1/3 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                required
              />
              <input
                type="text"
                placeholder="部门 (选填)"
                value={newDept}
                onChange={e => setNewDept(e.target.value)}
                className="w-1/3 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-colors whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>添加</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Participant Roster Table & Batch Actions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-colors">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="搜索姓名、部门、工号..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white w-48 sm:w-60 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {departments.length > 0 && (
              <select
                value={selectedDept}
                onChange={e => setSelectedDept(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                <option value="all">全部部门 ({departments.length})</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleToggleAll(true)}
              className="px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
            >
              全选资格
            </button>
            <button
              onClick={() => handleToggleAll(false)}
              className="px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
            >
              全取消
            </button>
            <button
              onClick={handleShuffleList}
              title="乱序重排"
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>乱序</span>
            </button>
            <button
              onClick={handleDeduplicate}
              className="px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
            >
              一键去重
            </button>
            <button
              onClick={() => {
                if (window.confirm('确认清空当前整个名单吗？')) {
                  setParticipants([]);
                  showToast('已清空所有名单', 'info');
                }
              }}
              disabled={participants.length === 0}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-30 rounded-md transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>清空</span>
            </button>
          </div>
        </div>

        {/* High density participant list table */}
        <div className="max-h-96 overflow-y-auto">
          {filteredParticipants.length === 0 ? (
            <div className="text-center py-14">
              <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {participants.length === 0 ? '暂无名单数据，可点击上方「载入名单示例」或直接粘贴' : '无匹配搜索结果'}
              </p>
              {participants.length === 0 && (
                <button
                  onClick={() => handleLoadPreset('annualGala50')}
                  className="mt-3 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                >
                  一键导入 50 人公司年会名单示例
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 sticky top-0 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-2.5 px-4 w-12 text-center">序号</th>
                  <th className="py-2.5 px-4">姓名</th>
                  <th className="py-2.5 px-4">部门</th>
                  <th className="py-2.5 px-4">工号</th>
                  <th className="py-2.5 px-4 w-28 text-center">抽奖/分组资格</th>
                  <th className="py-2.5 px-4 w-16 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredParticipants.map((p, idx) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-2.5 px-4 text-center font-mono tabular-nums text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-4 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                        style={{ backgroundColor: p.avatarColor }}
                      >
                        {p.name.slice(0, 1)}
                      </span>
                      <span>{p.name}</span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                      {p.department || '通用'}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-500">
                      {p.employeeId || '-'}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleEligible(p.id)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                          p.isEligible
                            ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100'
                            : 'text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200'
                        }`}
                      >
                        {p.isEligible ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span>就绪参与</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-slate-400" />
                            <span>缺席暂停</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteParticipant(p.id)}
                        title="删除该成员"
                        className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer Next Step Callouts */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>当前筛选显示 {filteredParticipants.length} 人</span>
            <span>·</span>
            <span>就绪参与池 {eligibleCount} 人</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateToLottery}
              disabled={eligibleCount === 0}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 rounded-lg transition-colors whitespace-nowrap"
            >
              前往奖品抽签 &rarr;
            </button>
            <button
              onClick={onNavigateToGrouping}
              disabled={eligibleCount === 0}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-40 rounded-lg transition-colors whitespace-nowrap"
            >
              前往智能随机分组 &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Preset Lists Modal */}
      {showPresetsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">选择名单示例模板</h3>
              </div>
              <button
                onClick={() => setShowPresetsModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-semibold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              系统预置了真实企业场景的人员名册，点击即可直接载入体验：
            </p>

            <div className="space-y-3">
              {(Object.keys(PRESET_ROSTERS) as Array<keyof typeof PRESET_ROSTERS>).map(key => {
                const item = PRESET_ROSTERS[key];
                return (
                  <div
                    key={key}
                    onClick={() => handleLoadPreset(key)}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {item.title}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.description}
                      </div>
                    </div>
                    <span className="text-xs font-mono font-medium px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-700 dark:text-slate-300">
                      {item.data.length} 人
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowPresetsModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
