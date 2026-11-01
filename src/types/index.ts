export interface Participant {
  id: string;
  name: string;
  department?: string;
  employeeId?: string;
  isEligible: boolean; // whether can be drawn or grouped (e.g. absent flag)
  avatarColor: string;
}

export interface Prize {
  id: string;
  name: string;
  count: number;
  iconName: string;
  color: string;
  description?: string;
}

export interface WinnerRecord {
  id: string;
  participantId: string;
  participantName: string;
  department?: string;
  prizeId: string;
  prizeName: string;
  timestamp: number;
  drawBatchId: string;
}

export type GroupMode = 'groupCount' | 'memberLimit';
export type GroupNamingStyle = 'numbers' | 'energy' | 'colors' | 'elements';

export interface GroupConfig {
  mode: GroupMode;
  groupCount: number;
  memberLimit: number;
  balanceDepartment: boolean;
  assignLeader: boolean;
  namingStyle: GroupNamingStyle;
}

export interface GroupResult {
  id: string;
  name: string;
  leaderId?: string;
  members: Participant[];
}
