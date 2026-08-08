import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { groupCode } from '../../shared/helpers/group-code.util';
import { eligibilityChip, groupStatusChip, paymentStatusChip } from '../../shared/helpers/status.util';
import { historyIcon } from '../../shared/helpers/history-icon.util';
import { SectionHeader } from '../../shared/components/section-header/section-header';
import { StatusChip } from '../../shared/components/status-chip/status-chip';
import { MemberAvatar } from '../../shared/components/member-avatar/member-avatar';
import { SummaryCard } from '../../shared/components/summary-card/summary-card';
import { TimelineItem } from '../../shared/components/timeline-item/timeline-item';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { GroupService } from '../../services/group.service';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-group-page',
  standalone: true,
  imports: [
    RouterLink,
    MatIconModule,
    SectionHeader,
    StatusChip,
    MemberAvatar,
    SummaryCard,
    TimelineItem,
    EmptyState,
    TranslatePipe,
  ],
  templateUrl: './group.html',
  styleUrl: './group.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupPage {
  private groupService = inject(GroupService);
  i18n = inject(I18nService);

  group = this.groupService.activeGroup;

  code = computed(() => {
    const g = this.group();
    return g ? groupCode(g.id) : '';
  });

  pot = computed(() => {
    const g = this.group();
    return g ? this.groupService.estimatedPot(g) : 0;
  });

  outstandingLoans = computed(() => {
    const g = this.group();
    return g ? g.loans.filter((l) => l.status === 'outstanding') : [];
  });

  recentActivity = computed(() => (this.group()?.history ?? []).slice(0, 6));

  drawTimeline = computed(() => [...(this.group()?.draws ?? [])].reverse());

  payoutSchedule = computed(() => {
    const g = this.group();
    if (!g || g.payoutOrder.length === 0) return [];

    return g.payoutOrder.map((memberId, index) => {
      const month = index + 1;
      const member = g.members.find((m) => m.id === memberId);
      const isPaid = g.draws.some((d) => d.month === month);
      const isCurrent = !isPaid && month === g.currentMonth && g.status === 'active';
      const state: 'paid' | 'current' | 'upcoming' = isPaid ? 'paid' : isCurrent ? 'current' : 'upcoming';
      return { month, member, state };
    });
  });

  groupStatusChip = groupStatusChip;
  paymentStatusChip = paymentStatusChip;
  eligibilityChip = eligibilityChip;
  historyIcon = historyIcon;

  scheduleStateChip(state: 'paid' | 'current' | 'upcoming'): { variant: 'success' | 'primary' | 'neutral'; labelKey: string; icon: string } {
    switch (state) {
      case 'paid':
        return { variant: 'success', labelKey: 'schedule.paidOut', icon: 'check_circle' };
      case 'current':
        return { variant: 'primary', labelKey: 'schedule.thisMonth', icon: 'bolt' };
      case 'upcoming':
        return { variant: 'neutral', labelKey: 'schedule.upcoming', icon: 'schedule' };
    }
  }
}
