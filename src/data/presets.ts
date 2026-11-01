import { Participant, Prize } from '../types/index.ts';

export const AVATAR_COLORS = [
  '#4F46E5', '#2563EB', '#0D9488', '#059669', '#D97706',
  '#DC2626', '#7C3AED', '#DB2777', '#0891B2', '#4B5563'
];

export const PRESET_ROSTERS = {
  annualGala50: {
    title: '企业年会全员名单 (50人)',
    description: '涵盖研发、产品、设计、市场、运营、HR等各部门完整名单',
    data: [
      { name: '陈子昂', department: '技术研发部', employeeId: 'RD001' },
      { name: '林舒涵', department: '技术研发部', employeeId: 'RD002' },
      { name: '张伟铭', department: '技术研发部', employeeId: 'RD003' },
      { name: '王若楠', department: '技术研发部', employeeId: 'RD004' },
      { name: '李俊杰', department: '技术研发部', employeeId: 'RD005' },
      { name: '周启明', department: '技术研发部', employeeId: 'RD006' },
      { name: '杨光耀', department: '技术研发部', employeeId: 'RD007' },
      { name: '赵梓涵', department: '技术研发部', employeeId: 'RD008' },
      { name: '孙沐晴', department: '技术研发部', employeeId: 'RD009' },
      { name: '徐博闻', department: '技术研发部', employeeId: 'RD010' },

      { name: '方知夏', department: '产品设计部', employeeId: 'PD001' },
      { name: '陆思源', department: '产品设计部', employeeId: 'PD002' },
      { name: '高雅晴', department: '产品设计部', employeeId: 'PD003' },
      { name: '沈云舒', department: '产品设计部', employeeId: 'PD004' },
      { name: '宋浩然', department: '产品设计部', employeeId: 'PD005' },
      { name: '顾念真', department: '产品设计部', employeeId: 'PD006' },
      { name: '唐嘉树', department: '产品设计部', employeeId: 'PD007' },
      { name: '叶知秋', department: '产品设计部', employeeId: 'PD008' },

      { name: '苏雨桐', department: '市场商务部', employeeId: 'MK001' },
      { name: '魏明哲', department: '市场商务部', employeeId: 'MK002' },
      { name: '潘晓彤', department: '市场商务部', employeeId: 'MK003' },
      { name: '姜天赐', department: '市场商务部', employeeId: 'MK004' },
      { name: '白语蝶', department: '市场商务部', employeeId: 'MK005' },
      { name: '韩立诚', department: '市场商务部', employeeId: 'MK006' },
      { name: '崔逸凡', department: '市场商务部', employeeId: 'MK007' },

      { name: '何文静', department: '用户运营部', employeeId: 'OP001' },
      { name: '彭宇飞', department: '用户运营部', employeeId: 'OP002' },
      { name: '罗雪见', department: '用户运营部', employeeId: 'OP003' },
      { name: '袁绍辉', department: '用户运营部', employeeId: 'OP004' },
      { name: '钟灵毓', department: '用户运营部', employeeId: 'OP005' },
      { name: '薛正阳', department: '用户运营部', employeeId: 'OP006' },
      { name: '丁思聪', department: '用户运营部', employeeId: 'OP007' },
      { name: '卢青禾', department: '用户运营部', employeeId: 'OP008' },

      { name: '邓欣怡', department: '人力行政部', employeeId: 'HR001' },
      { name: '蒋少博', department: '人力行政部', employeeId: 'HR002' },
      { name: '江映雪', department: '人力行政部', employeeId: 'HR003' },
      { name: '余佳恩', department: '人力行政部', employeeId: 'HR004' },
      { name: '石景明', department: '人力行政部', employeeId: 'HR005' },
      { name: '贾佩佩', department: '人力行政部', employeeId: 'HR006' },

      { name: '傅凌天', department: '财务风控部', employeeId: 'FN001' },
      { name: '万晓薇', department: '财务风控部', employeeId: 'FN002' },
      { name: '段玉轩', department: '财务风控部', employeeId: 'FN003' },
      { name: '金晨阳', department: '财务风控部', employeeId: 'FN004' },
      { name: '毛秋涵', department: '财务风控部', employeeId: 'FN005' },

      { name: '邱子墨', department: '战略总经办', employeeId: 'GM001' },
      { name: '常远航', department: '战略总经办', employeeId: 'GM002' },
      { name: '严谨言', department: '战略总经办', employeeId: 'GM003' },
      { name: '尹梦竹', department: '战略总经办', employeeId: 'GM004' },
      { name: '龚海峰', department: '战略总经办', employeeId: 'GM005' },
      { name: '施巧玲', department: '战略总经办', employeeId: 'GM006' },
    ]
  },
  teamBuilding24: {
    title: '户外团建拓展破冰名单 (24人)',
    description: '中型规模，最适宜分为 4-6 组进行竞技与现场奖项抽取',
    data: [
      { name: '李承泽', department: '业务一组' },
      { name: '夏安安', department: '业务一组' },
      { name: '肖远图', department: '业务一组' },
      { name: '孟清雅', department: '业务一组' },
      { name: '杜明德', department: '业务一组' },
      { name: '谭笑笑', department: '业务一组' },
      { name: '乔振宇', department: '技术组' },
      { name: '曲婉清', department: '技术组' },
      { name: '管志强', department: '技术组' },
      { name: '向日葵', department: '技术组' },
      { name: '洪海涛', department: '技术组' },
      { name: '包明哲', department: '技术组' },
      { name: '莫小贝', department: '市场组' },
      { name: '孔令辉', department: '市场组' },
      { name: '查文斌', department: '市场组' },
      { name: '容小萱', department: '市场组' },
      { name: '卞思远', department: '市场组' },
      { name: '郁达夫', department: '市场组' },
      { name: '童佳慧', department: '运营部' },
      { name: '车晓峰', department: '运营部' },
      { name: '游子健', department: '运营部' },
      { name: '梅丽华', department: '人事部' },
      { name: '焦恩俊', department: '财务部' },
      { name: '单立文', department: '设计部' },
    ]
  },
  compact12: {
    title: '小团队体验名单 (12人)',
    description: '小规模快速上手体验抽签与分组功能',
    data: [
      { name: '赵云', department: '先锋部' },
      { name: '关羽', department: '先锋部' },
      { name: '张飞', department: '先锋部' },
      { name: '诸葛亮', department: '智囊团' },
      { name: '庞统', department: '智囊团' },
      { name: '黄月英', department: '研发部' },
      { name: '马超', department: '骑兵部' },
      { name: '黄忠', department: '神射部' },
      { name: '魏延', department: '突击部' },
      { name: '姜维', department: '统筹部' },
      { name: '法正', department: '策划部' },
      { name: '孙尚香', department: '督导部' }
    ]
  }
};

export const INITIAL_PRIZES: Prize[] = [
  {
    id: 'prize-grand',
    name: '特等奖 · 最新 iPhone 16 Pro',
    count: 1,
    iconName: 'Smartphone',
    color: '#8B5CF6',
    description: '年度最佳幸运员工专属豪华大奖'
  },
  {
    id: 'prize-first',
    name: '一等奖 · 戴森高速吹风机',
    count: 2,
    iconName: 'Wind',
    color: '#EC4899',
    description: '沙龙级护发黑科技'
  },
  {
    id: 'prize-second',
    name: '二等奖 · 索尼头戴降噪耳机',
    count: 3,
    iconName: 'Headphones',
    color: '#3B82F6',
    description: '办公差旅静享沉浸音乐'
  },
  {
    id: 'prize-third',
    name: '三等奖 · 胶囊浓缩咖啡机',
    count: 5,
    iconName: 'Coffee',
    color: '#D97706',
    description: '唤醒每个工作日的灵感'
  },
  {
    id: 'prize-lucky',
    name: '幸运阳光普照奖 · 定制礼盒',
    count: 10,
    iconName: 'Gift',
    color: '#10B981',
    description: '全员共享的温馨心意'
  }
];

export const TEAM_NAMES = {
  numbers: (i: number) => `第 ${i + 1} 组`,
  energy: [
    '乘风破浪队', '极客先锋队', '超能战队', '星火燎原队',
    '梦想舰队', '智囊突击队', '同心致远队', '巅峰领航队',
    '无畏勇士队', '创变未来队', '万象更新队', '雷霆万钧队'
  ],
  colors: [
    '烈火红队', '深邃蓝队', '常胜绿队', '璀璨金队',
    '破晓紫队', '风暴橙队', '闪电青队', '极光粉队',
    '银河灰队', '琥珀黄队'
  ],
  elements: [
    '青龙腾云队', '白虎疾风队', '朱雀烈焰队', '玄武定坤队',
    '麒麟呈祥队', '腾蛇破阵队', '九霄鲲鹏队', '灵狐追光队'
  ]
};

export function createParticipant(name: string, department?: string, employeeId?: string): Participant {
  const hash = Math.abs(name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));
  return {
    id: 'p_' + Math.random().toString(36).substring(2, 9),
    name: name.trim(),
    department: department?.trim() || '通用',
    employeeId: employeeId?.trim(),
    isEligible: true,
    avatarColor: AVATAR_COLORS[hash % AVATAR_COLORS.length]
  };
}

export function parseParticipantsFromText(rawText: string): Participant[] {
  if (!rawText || !rawText.trim()) return [];

  // Split lines or delimiters like comma, semicolons, tabs, full-width comma
  const rawLines = rawText.split(/[\r\n]+/);
  const result: Participant[] = [];

  for (const line of rawLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check if line contains comma / tab / pipe separating name and department/ID
    const parts = trimmed.split(/[,，\t|]/).map(p => p.trim()).filter(Boolean);

    if (parts.length >= 2) {
      // Form: Name, Department, EmployeeID
      const name = parts[0];
      const dept = parts[1];
      const empId = parts[2] || undefined;
      if (name) result.push(createParticipant(name, dept, empId));
    } else {
      // Check for parentheses like "张三 (技术研发部)" or "李四-财务部"
      const match = trimmed.match(/^([^\s(-—]+)[\s(-—]+([^)\s]+)\)?$/);
      if (match && match[1] && match[2]) {
        result.push(createParticipant(match[1], match[2]));
      } else {
        // Just name or space-separated names
        const spaceSeparated = trimmed.split(/\s+/).filter(Boolean);
        if (spaceSeparated.length > 1 && spaceSeparated.length <= 2) {
          result.push(createParticipant(spaceSeparated[0], spaceSeparated[1]));
        } else {
          for (const s of spaceSeparated) {
            result.push(createParticipant(s));
          }
        }
      }
    }
  }

  return result;
}
