import { PaymentStatus } from './payment.model';

export interface GroupMember {
  id: string;
  userId: string;
  name: string;
  avatarColor: string;
  avatarInitials: string;
  joinedAt: string;
  hasWon: boolean;
  wonMonth?: number;
  isEligible: boolean;
  currentPaymentStatus: PaymentStatus;
  totalContributed: number;
  isCurrentUser?: boolean;
}
