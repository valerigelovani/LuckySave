export type LoanStatus = 'outstanding' | 'repaid';

export interface Loan {
  id: string;
  groupId: string;
  memberId: string;
  memberName: string;
  month: number;
  amount: number;
  remainingBalance: number;
  status: LoanStatus;
  createdAt: string;
  repaidAt?: string;
}
