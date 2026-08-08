import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { HistoryEventType } from '../../core/models';
import { formatCurrency } from '../../core/utils/currency.util';
import { formatDate } from '../../core/utils/date.util';
import { historyIcon } from '../../shared/helpers/history-icon.util';
import { SectionHeader } from '../../shared/components/section-header/section-header';
import { TimelineItem } from '../../shared/components/timeline-item/timeline-item';
import { MemberAvatar } from '../../shared/components/member-avatar/member-avatar';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { GroupService } from '../../services/group.service';

type FilterKey = 'all' | 'draw' | 'payment' | 'loan' | 'membership';

const FILTER_TYPES: Record<FilterKey, HistoryEventType[] | null> = {
  all: null,
  draw: ['draw_completed'],
  payment: ['payment_made', 'payment_late'],
  loan: ['loan_created', 'loan_repaid'],
  membership: ['group_created', 'member_joined'],
};

@Component({
  selector: 'app-history-page',
  standalone: true,
  imports: [RouterLink, MatIconModule, SectionHeader, TimelineItem, MemberAvatar, EmptyState],
  templateUrl: './history.html',
  styleUrl: './history.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryPage {
  private groupService = inject(GroupService);

  myGroups = this.groupService.myGroups;
  group = this.groupService.activeGroup;

  filter = signal<FilterKey>('all');
  filters: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'All activity' },
    { key: 'draw', label: 'Draws' },
    { key: 'payment', label: 'Payments' },
    { key: 'loan', label: 'Bank coverage' },
    { key: 'membership', label: 'Membership' },
  ];

  monthlyDigest = computed(() => {
    const g = this.group();
    if (!g) return [];

    const months = Math.max(g.currentMonth, g.draws.length);
    return Array.from({ length: months }, (_, i) => {
      const month = i + 1;
      const draw = g.draws.find((d) => d.month === month) ?? null;
      const payments = g.payments.filter((p) => p.month === month);
      const paidCount = payments.filter((p) => p.status === 'paid' || p.status === 'covered').length;
      const loans = g.loans.filter((l) => l.month === month);
      const lateEvents = payments.filter((p) => p.status === 'covered' || p.status === 'late');
      return {
        month,
        draw,
        totalMembers: g.totalMembers,
        paidCount,
        loans,
        hasLateEvents: lateEvents.length > 0,
        isCurrent: month === g.currentMonth && g.status === 'active',
      };
    }).reverse();
  });

  filteredHistory = computed(() => {
    const g = this.group();
    if (!g) return [];
    const types = FILTER_TYPES[this.filter()];
    if (!types) return g.history;
    return g.history.filter((item) => types.includes(item.type));
  });

  formatCurrency = formatCurrency;
  formatDate = formatDate;
  historyIcon = historyIcon;

  setFilter(key: FilterKey): void {
    this.filter.set(key);
  }

  switchGroup(groupId: string): void {
    this.groupService.setActiveGroup(groupId);
  }
}
