export type PaymentStatus = 'paid' | 'pending' | 'late' | 'covered';

export interface Payment {
  id: string;
  groupId: string;
  memberId: string;
  month: number;
  amount: number;
  status: PaymentStatus;
  dueDate: string;
  paidAt?: string;
}
