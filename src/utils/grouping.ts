import { Participant, GroupConfig, GroupResult } from '../types/index.ts';
import { TEAM_NAMES } from '../data/presets.ts';

// Fisher-Yates shuffle
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateGroups(participants: Participant[], config: GroupConfig): GroupResult[] {
  // Only include eligible participants
  const eligible = participants.filter(p => p.isEligible);
  const total = eligible.length;
  if (total === 0) return [];

  let numGroups = 1;

  if (config.mode === 'groupCount') {
    numGroups = Math.max(1, Math.min(config.groupCount, total));
  } else {
    // Mode: memberLimit
    const limit = Math.max(1, config.memberLimit);
    numGroups = Math.max(1, Math.ceil(total / limit));
  }

  // Initialize empty groups
  const groups: Participant[][] = Array.from({ length: numGroups }, () => []);

  if (config.balanceDepartment) {
    // Group participants by department first
    const deptMap = new Map<string, Participant[]>();
    for (const p of eligible) {
      const dept = p.department || '通用';
      if (!deptMap.has(dept)) deptMap.set(dept, []);
      deptMap.get(dept)!.push(p);
    }

    // Shuffle within each department
    for (const [dept, list] of deptMap.entries()) {
      deptMap.set(dept, shuffleArray(list));
    }

    // Sort departments by size descending to interleave largest departments across groups first
    const sortedDepts = Array.from(deptMap.entries()).sort((a, b) => b[1].length - a[1].length);

    let currentGroupIndex = 0;
    for (const [, list] of sortedDepts) {
      for (const p of list) {
        // Find group with smallest size to maintain balance
        let targetGroup = 0;
        let minSize = groups[0].length;
        for (let g = 1; g < numGroups; g++) {
          if (groups[g].length < minSize) {
            minSize = groups[g].length;
            targetGroup = g;
          }
        }
        // If tied, advance round-robin
        if (groups[currentGroupIndex % numGroups].length === minSize) {
          targetGroup = currentGroupIndex % numGroups;
        }
        groups[targetGroup].push(p);
        currentGroupIndex++;
      }
    }
  } else {
    // Pure random shuffle
    const shuffled = shuffleArray(eligible);
    shuffled.forEach((p, idx) => {
      groups[idx % numGroups].push(p);
    });
  }

  // Get group names based on config
  const namingStyle = config.namingStyle || 'numbers';

  const results: GroupResult[] = groups.map((members, idx) => {
    let name = '';
    if (namingStyle === 'numbers') {
      name = TEAM_NAMES.numbers(idx);
    } else if (namingStyle === 'energy') {
      name = TEAM_NAMES.energy[idx % TEAM_NAMES.energy.length] || `卓越战队 ${idx + 1}`;
    } else if (namingStyle === 'colors') {
      name = TEAM_NAMES.colors[idx % TEAM_NAMES.colors.length] || `战色分队 ${idx + 1}`;
    } else if (namingStyle === 'elements') {
      name = TEAM_NAMES.elements[idx % TEAM_NAMES.elements.length] || `天象组 ${idx + 1}`;
    }

    // Random leader if requested
    let leaderId: string | undefined = undefined;
    if (config.assignLeader && members.length > 0) {
      const randomLeaderIndex = Math.floor(Math.random() * members.length);
      leaderId = members[randomLeaderIndex].id;
    }

    return {
      id: 'grp_' + (idx + 1) + '_' + Math.random().toString(36).substring(2, 7),
      name,
      leaderId,
      members
    };
  });

  return results;
}
