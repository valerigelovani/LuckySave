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
  /**
   * Full month-by-month payout order, generated once as a random shuffle the
   * moment the group fills its last seat. payoutOrder[0] is the member id
   * receiving month 1's pot, payoutOrder[1] month 2's, and so on — the whole
   * schedule is fixed and visible up front rather than redrawn each month.
   */
  payoutOrder: string[];
}
