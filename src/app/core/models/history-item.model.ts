export type HistoryEventType =
  | 'group_created'
  | 'member_joined'
  | 'payment_made'
  | 'payment_late'
  | 'draw_completed'
  | 'loan_created'
  | 'loan_repaid';

export interface HistoryItem {
  id: string;
  groupId: string;
  type: HistoryEventType;
  month: number;
  title: string;
  description: string;
  timestamp: string;
  amount?: number;
}
