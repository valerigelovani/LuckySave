import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { GroupMember } from '../../core/models';
import { formatCurrency } from '../../core/utils/currency.util';
import { groupCode } from '../../shared/helpers/group-code.util';
import { eligibilityChip, groupStatusChip, paymentStatusChip } from '../../shared/helpers/status.util';
import { SummaryCard } from '../../shared/components/summary-card/summary-card';
import { StatusChip } from '../../shared/components/status-chip/status-chip';
import { MemberAvatar } from '../../shared/components/member-avatar/member-avatar';
import { CountdownDisplay } from '../../shared/components/countdown-display/countdown-display';
import { NotificationBanner } from '../../shared/components/notification-banner/notification-banner';
import { SectionHeader } from '../../shared/components/section-header/section-header';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { GroupService } from '../../services/group.service';
import { PaymentService } from '../../services/payment.service';
import { DrawService } from '../../services/draw.service';
import { StoreService } from '../../services/store.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    MatIconModule,
    SummaryCard,
    StatusChip,
    MemberAvatar,
    CountdownDisplay,
    NotificationBanner,
    SectionHeader,
    EmptyState,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  private groupService = inject(GroupService);
  private paymentService = inject(PaymentService);
  private drawService = inject(DrawService);
  private store = inject(StoreService);
  private router = inject(Router);

  currentUser = this.store.currentUser;
  myGroups = this.groupService.myGroups;
  activeGroup = this.groupService.activeGroup;

  member = computed<GroupMember | undefined>(() => {
    const group = this.activeGroup();
    return group ? this.groupService.currentUserMember(group) : undefined;
  });

  position = computed(() => {
    const group = this.activeGroup();
    const m = this.member();
    if (!group || !m) return 0;
    const sorted = [...group.members].sort(
      (a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime(),
    );
    return sorted.findIndex((x) => x.id === m.id) + 1;
  });

  pot = computed(() => {
    const group = this.activeGroup();
    return group ? this.groupService.estimatedPot(group) : 0;
  });

  paidCount = computed(() => {
    const group = this.activeGroup();
    return group ? this.groupService.paidThisMonthCount(group) : 0;
  });

  remainingMonths = computed(() => {
    const group = this.activeGroup();
    if (!group) return 0;
    return Math.max(0, group.durationMonths - group.draws.length);
  });

  canDraw = computed(() => {
    const group = this.activeGroup();
    return group ? this.drawService.canDraw(group) : false;
  });

  hasDrawnThisMonth = computed(() => {
    const group = this.activeGroup();
    return group ? this.drawService.hasDrawnThisMonth(group) : false;
  });

  groupStatus = computed(() => {
    const group = this.activeGroup();
    return group ? groupStatusChip(group.status) : null;
  });

  paymentStatus = computed(() => {
    const m = this.member();
    return m ? paymentStatusChip(m.currentPaymentStatus) : null;
  });

  eligibility = computed(() => {
    const m = this.member();
    return m ? eligibilityChip(m.hasWon, m.isEligible) : null;
  });

  progressPercent = computed(() => {
    const group = this.activeGroup();
    if (!group) return 0;
    return Math.round(this.groupService.progressRatio(group) * 100);
  });

  code = computed(() => {
    const group = this.activeGroup();
    return group ? groupCode(group.id) : '';
  });

  formatCurrency = formatCurrency;

  switchGroup(groupId: string): void {
    this.groupService.setActiveGroup(groupId);
  }

  payNow(): void {
    const group = this.activeGroup();
    const m = this.member();
    if (!group || !m) return;
    this.paymentService.payContribution(group.id, m.id);
  }

  goToDraw(): void {
    this.router.navigate(['/draw']);
  }
}
