import { GroupStatus, PaymentStatus } from '../../core/models';

export type ChipVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary';

export interface ChipDescriptor {
  variant: ChipVariant;
  label: string;
  icon: string;
}

export function paymentStatusChip(status: PaymentStatus): ChipDescriptor {
  switch (status) {
    case 'paid':
      return { variant: 'success', label: 'Paid', icon: 'check_circle' };
    case 'pending':
      return { variant: 'neutral', label: 'Pending', icon: 'schedule' };
    case 'late':
      return { variant: 'danger', label: 'Late', icon: 'error' };
    case 'covered':
      return { variant: 'info', label: 'Bank covered', icon: 'shield' };
  }
}

export function groupStatusChip(status: GroupStatus): ChipDescriptor {
  switch (status) {
    case 'forming':
      return { variant: 'warning', label: 'Filling up', icon: 'group_add' };
    case 'active':
      return { variant: 'success', label: 'Active', icon: 'bolt' };
    case 'completed':
      return { variant: 'neutral', label: 'Completed', icon: 'task_alt' };
  }
}

export function eligibilityChip(hasWon: boolean, isEligible: boolean): ChipDescriptor {
  if (hasWon) return { variant: 'primary', label: 'Already won', icon: 'emoji_events' };
  if (isEligible) return { variant: 'success', label: 'Eligible', icon: 'check_circle' };
  return { variant: 'neutral', label: 'Not eligible', icon: 'block' };
}
