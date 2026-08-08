import { DrawResult } from './draw-result.model';
import { GroupMember } from './group-member.model';
import { HistoryItem } from './history-item.model';
import { Loan } from './loan.model';
import { Payment } from './payment.model';

export type GroupStatus = 'forming' | 'active' | 'completed';

export interface Group {
  id: string;
  name: string;
  description?: string;
  monthlyContribution: number;
  totalMembers: number;
  durationMonths: number;
  isPrivate: boolean;
  autoRandomDraw: boolean;
  status: GroupStatus;
  currentMonth: number;
  createdAt: string;
  nextDrawDate: string;
  members: GroupMember[];
  payments: Payment[];
  draws: DrawResult[];
  loans: Loan[];
  history: HistoryItem[];
}
