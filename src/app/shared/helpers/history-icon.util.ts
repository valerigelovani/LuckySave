import { HistoryEventType } from '../../core/models';
import { TimelineVariant } from '../components/timeline-item/timeline-item';

export interface HistoryIconDescriptor {
  icon: string;
  variant: TimelineVariant;
}

const HISTORY_ICON_MAP: Record<HistoryEventType, HistoryIconDescriptor> = {
  draw_completed: { icon: 'workspace_premium', variant: 'gold' },
  payment_made: { icon: 'check_circle', variant: 'mint' },
  payment_late: { icon: 'error', variant: 'coral' },
  loan_created: { icon: 'account_balance', variant: 'info' },
  loan_repaid: { icon: 'task_alt', variant: 'mint' },
  member_joined: { icon: 'person_add', variant: 'primary' },
  group_created: { icon: 'flag', variant: 'neutral' },
};

export function historyIcon(type: HistoryEventType): HistoryIconDescriptor {
  return HISTORY_ICON_MAP[type];
}
