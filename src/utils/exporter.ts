import { Participant, WinnerRecord, GroupResult } from '../types/index.ts';

export function downloadCSV(filename: string, csvContent: string) {
  // Add UTF-8 BOM so Microsoft Excel opens Chinese characters without garbled text
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportRosterToCSV(participants: Participant[]) {
  const headers = ['姓名', '部门', '工号', '状态'];
  const rows = participants.map(p => [
    `"${p.name.replace(/"/g, '""')}"`,
    `"${(p.department || '通用').replace(/"/g, '""')}"`,
    `"${(p.employeeId || '').replace(/"/g, '""')}"`,
    `"${p.isEligible ? '参与中' : '已暂停'}"`
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadCSV(`HR名单_${dateStr}.csv`, csv);
}

export function exportWinnersToCSV(winners: WinnerRecord[]) {
  const headers = ['获奖序号', '中奖者姓名', '所属部门', '奖项名称', '中奖时间'];
  const rows = winners.map((w, index) => [
    index + 1,
    `"${w.participantName.replace(/"/g, '""')}"`,
    `"${(w.department || '-').replace(/"/g, '""')}"`,
    `"${w.prizeName.replace(/"/g, '""')}"`,
    `"${new Date(w.timestamp).toLocaleString('zh-CN')}"`
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadCSV(`中奖名单_${dateStr}.csv`, csv);
}

export function exportGroupsToCSV(groups: GroupResult[]) {
  const headers = ['小组名称', '组内序号', '组员姓名', '部门', '是否组长'];
  const rows: string[] = [];

  groups.forEach(g => {
    g.members.forEach((m, idx) => {
      const isLeader = g.leaderId === m.id ? '是' : '否';
      rows.push([
        `"${g.name.replace(/"/g, '""')}"`,
        idx + 1,
        `"${m.name.replace(/"/g, '""')}"`,
        `"${(m.department || '-').replace(/"/g, '""')}"`,
        `"${isLeader}"`
      ].join(','));
    });
  });

  const csv = [headers.join(','), ...rows].join('\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadCSV(`随机分组结果_${dateStr}.csv`, csv);
}

export function formatGroupsAsMarkdown(groups: GroupResult[]): string {
  const lines: string[] = ['📋 **HR团队随机分组结果汇总**\n'];
  groups.forEach((g) => {
    lines.push(`### 🔹 ${g.name} (${g.members.length}人)`);
    g.members.forEach((m, idx) => {
      const leaderBadge = g.leaderId === m.id ? ' 👑 [组长]' : '';
      const deptStr = m.department ? ` (${m.department})` : '';
      lines.push(`${idx + 1}. ${m.name}${deptStr}${leaderBadge}`);
    });
    lines.push('');
  });
  return lines.join('\n');
}
