import { Injectable, inject } from '@angular/core';
import { HistoryItem, Loan, Payment } from '../core/models';
import { createId } from '../core/utils/id.util';
import { StoreService } from './store.service';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private store = inject(StoreService);
  private toast = inject(ToastService);

  payContribution(groupId: string, memberId: string): void {
    const group = this.store.getGroup(groupId);
    if (!group) return;

    const member = group.members.find((m) => m.id === memberId);
    if (!member) return;

    const existing = group.payments.find((p) => p.memberId === memberId && p.month === group.currentMonth);

    if (existing && (existing.status === 'paid' || existing.status === 'covered')) {
      this.toast.info('Already paid', 'This month is already settled.');
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
        title: `${member.name} paid the contribution`,
        description: `Month ${g.currentMonth} contribution of $${g.monthlyContribution} received.`,
        timestamp: now,
        amount: g.monthlyContribution,
      };

      return { ...g, payments, members, history: [historyEntry, ...g.history] };
    });

    this.toast.success('Payment received', `Your $${group.monthlyContribution} contribution has been recorded.`);
  }

  simulateMissedPayment(groupId: string, memberId: string): void {
    const group = this.store.getGroup(groupId);
    if (!group) return;

    const member = group.members.find((m) => m.id === memberId);
    if (!member) return;

    const existing = group.payments.find((p) => p.memberId === memberId && p.month === group.currentMonth);
    if (existing && (existing.status === 'paid' || existing.status === 'covered')) {
      this.toast.info('Nothing to simulate', 'This month is already settled for this member.');
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
        title: `${member.name} missed the deadline`,
        description: `${member.name}'s month ${g.currentMonth} contribution was not received by the due date.`,
        timestamp: now,
      };

      const loanHistory: HistoryItem = {
        id: createId('hist'),
        groupId,
        type: 'loan_created',
        month: g.currentMonth,
        title: 'Bank covered the shortfall',
        description: `The bank covered ${member.name}'s contribution and opened a loan record.`,
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

    this.toast.warning('Payment covered by the bank', `A loan record was created for ${member.name}.`);
  }
}
