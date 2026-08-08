import { GroupStatus, PaymentStatus } from '../../core/models';

export type ChipVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary';

export interface ChipDescriptor {
  variant: ChipVariant;
  labelKey: string;
  icon: string;
}

export function paymentStatusChip(status: PaymentStatus): ChipDescriptor {
  switch (status) {
    case 'paid':
      return { variant: 'success', labelKey: 'status.paid', icon: 'check_circle' };
    case 'pending':
      return { variant: 'neutral', labelKey: 'status.pending', icon: 'schedule' };
    case 'late':
      return { variant: 'danger', labelKey: 'status.late', icon: 'error' };
    case 'covered':
      return { variant: 'info', labelKey: 'status.covered', icon: 'shield' };
  }
}

export function groupStatusChip(status: GroupStatus): ChipDescriptor {
  switch (status) {
    case 'forming':
      return { variant: 'warning', labelKey: 'status.forming', icon: 'group_add' };
    case 'active':
      return { variant: 'success', labelKey: 'status.active', icon: 'bolt' };
    case 'completed':
      return { variant: 'neutral', labelKey: 'status.completed', icon: 'task_alt' };
  }
}

export function eligibilityChip(hasWon: boolean, isEligible: boolean): ChipDescriptor {
  if (hasWon) return { variant: 'primary', labelKey: 'status.alreadyWon', icon: 'emoji_events' };
  if (isEligible) return { variant: 'success', labelKey: 'status.eligible', icon: 'check_circle' };
  return { variant: 'neutral', labelKey: 'status.notEligible', icon: 'block' };
}
