import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { GroupMember } from '../../core/models';
import { formatCurrency } from '../../core/utils/currency.util';
import { formatDate } from '../../core/utils/date.util';
import { historyIcon } from '../../shared/helpers/history-icon.util';
import { SectionHeader } from '../../shared/components/section-header/section-header';
import { StatusChip } from '../../shared/components/status-chip/status-chip';
import { MemberAvatar } from '../../shared/components/member-avatar/member-avatar';
import { TimelineItem } from '../../shared/components/timeline-item/timeline-item';
import { NotificationBanner } from '../../shared/components/notification-banner/notification-banner';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { GroupService } from '../../services/group.service';
import { PaymentService } from '../../services/payment.service';
import { LoanService } from '../../services/loan.service';

@Component({
  selector: 'app-loan-page',
  standalone: true,
  imports: [
    RouterLink,
    MatIconModule,
    SectionHeader,
    StatusChip,
    MemberAvatar,
    TimelineItem,
    NotificationBanner,
    EmptyState,
  ],
  templateUrl: './loan.html',
  styleUrl: './loan.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoanPage {
  private groupService = inject(GroupService);
  private paymentService = inject(PaymentService);
  private loanService = inject(LoanService);

  group = this.groupService.activeGroup;

  member = computed(() => {
    const g = this.group();
    return g ? this.groupService.currentUserMember(g) : undefined;
  });

  outstandingLoans = computed(() => (this.group()?.loans ?? []).filter((l) => l.status === 'outstanding'));
  repaidLoans = computed(() => (this.group()?.loans ?? []).filter((l) => l.status === 'repaid'));

  loanEvents = computed(() =>
    (this.group()?.history ?? []).filter((item) =>
      (['loan_created', 'loan_repaid', 'payment_late'] as string[]).includes(item.type),
    ),
  );

  canSimulate = computed(() => this.member()?.currentPaymentStatus === 'pending');

  formatCurrency = formatCurrency;
  formatDate = formatDate;
  historyIcon = historyIcon;

  simulateMissedPayment(): void {
    const g = this.group();
    const m = this.member();
    if (!g || !m) return;
    this.paymentService.simulateMissedPayment(g.id, m.id);
  }

  memberFor(memberId: string): GroupMember | undefined {
    return this.group()?.members.find((m) => m.id === memberId);
  }

  repay(loanId: string): void {
    const g = this.group();
    if (!g) return;
    this.loanService.repayLoan(g.id, loanId);
  }
}
