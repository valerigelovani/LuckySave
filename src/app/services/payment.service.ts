import { Injectable, inject } from '@angular/core';
import { HistoryItem, Loan, Payment } from '../core/models';
import { createId } from '../core/utils/id.util';
import { StoreService } from './store.service';
import { ToastService } from './toast.service';
import { I18nService } from './i18n.service';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private store = inject(StoreService);
  private toast = inject(ToastService);
  private i18n = inject(I18nService);

  payContribution(groupId: string, memberId: string): void {
    const group = this.store.getGroup(groupId);
    if (!group) return;

    const member = group.members.find((m) => m.id === memberId);
    if (!member) return;

    const existing = group.payments.find((p) => p.memberId === memberId && p.month === group.currentMonth);

    if (existing && (existing.status === 'paid' || existing.status === 'covered')) {
      this.toast.info(this.i18n.t('toast.alreadyPaidTitle'), this.i18n.t('toast.alreadyPaidMessage'));
      return;
    }

    this.store.updateGroup(groupId, (g) => {
      const now = new Date().toISOString();
      let payments: Payment[];

      if (existing) {
        payments = g.payments.map((p) =>
          p.id === existing.id ? { ...p, status: 'paid' as const, paidAt: now } : p,
        );
      } else {
        const newPayment: Payment = {
          id: createId('pay'),
          groupId,
          memberId,
          month: g.currentMonth,
          amount: g.monthlyContribution,
          status: 'paid',
          dueDate: g.nextDrawDate,
          paidAt: now,
        };
        payments = [...g.payments, newPayment];
      }

      const members = g.members.map((m) =>
        m.id === memberId
          ? { ...m, currentPaymentStatus: 'paid' as const, totalContributed: m.totalContributed + g.monthlyContribution }
          : m,
      );

      const historyEntry: HistoryItem = {
        id: createId('hist'),
        groupId,
        type: 'payment_made',
        month: g.currentMonth,
        titleKey: 'event.paymentMade.title',
        titleParams: { name: member.name },
        descriptionKey: 'event.paymentMade.desc',
        descriptionParams: { month: g.currentMonth, amount: g.monthlyContribution },
        timestamp: now,
        amount: g.monthlyContribution,
      };

      return { ...g, payments, members, history: [historyEntry, ...g.history] };
    });

    this.toast.success(
      this.i18n.t('toast.paymentReceivedTitle'),
      this.i18n.t('toast.paymentReceivedMessage', { amount: this.i18n.formatCurrency(group.monthlyContribution) }),
    );
  }

  simulateMissedPayment(groupId: string, memberId: string): void {
    const group = this.store.getGroup(groupId);
    if (!group) return;

    const member = group.members.find((m) => m.id === memberId);
    if (!member) return;

    const existing = group.payments.find((p) => p.memberId === memberId && p.month === group.currentMonth);
    if (existing && (existing.status === 'paid' || existing.status === 'covered')) {
      this.toast.info(this.i18n.t('toast.simulateNothingTitle'), this.i18n.t('toast.simulateNothingMessage'));
      return;
    }

    this.store.updateGroup(groupId, (g) => {
      const now = new Date().toISOString();

      const payments: Payment[] = existing
        ? g.payments.map((p) => (p.id === existing.id ? { ...p, status: 'covered' as const } : p))
        : [
            ...g.payments,
            {
              id: createId('pay'),
              groupId,
              memberId,
              month: g.currentMonth,
              amount: g.monthlyContribution,
              status: 'covered' as const,
              dueDate: g.nextDrawDate,
            },
          ];

      const members = g.members.map((m) => (m.id === memberId ? { ...m, currentPaymentStatus: 'covered' as const } : m));

      const newLoan: Loan = {
        id: createId('loan'),
        groupId,
        memberId,
        memberName: member.name,
        month: g.currentMonth,
        amount: g.monthlyContribution,
        remainingBalance: g.monthlyContribution,
        status: 'outstanding',
        createdAt: now,
      };

      const missedHistory: HistoryItem = {
        id: createId('hist'),
        groupId,
        type: 'payment_late',
        month: g.currentMonth,
        titleKey: 'event.paymentLate.title',
        titleParams: { name: member.name },
        descriptionKey: 'event.paymentLate.desc',
        descriptionParams: { name: member.name, month: g.currentMonth },
        timestamp: now,
      };

      const loanHistory: HistoryItem = {
        id: createId('hist'),
        groupId,
        type: 'loan_created',
        month: g.currentMonth,
        titleKey: 'event.loanCreated.title',
        descriptionKey: 'event.loanCreated.desc',
        descriptionParams: { name: member.name },
        timestamp: now,
        amount: g.monthlyContribution,
      };

      return {
        ...g,
        payments,
        members,
        loans: [...g.loans, newLoan],
        history: [loanHistory, missedHistory, ...g.history],
      };
    });

    this.toast.warning(
      this.i18n.t('toast.bankCoveredTitle'),
      this.i18n.t('toast.bankCoveredMessage', { name: member.name }),
    );
  }
}
