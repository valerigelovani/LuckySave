export type HistoryEventType =
  | 'group_created'
  | 'member_joined'
  | 'payment_made'
  | 'payment_late'
  | 'draw_completed'
  | 'loan_created'
  | 'loan_repaid';

export type HistoryEventParams = Record<string, string | number>;

export interface HistoryItem {
  id: string;
  groupId: string;
  type: HistoryEventType;
  month: number;
  titleKey: string;
  titleParams?: HistoryEventParams;
  descriptionKey: string;
  descriptionParams?: HistoryEventParams;
  timestamp: string;
  amount?: number;
}
