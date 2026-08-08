import { Injectable, inject } from '@angular/core';
import { HistoryItem } from '../core/models';
import { createId } from '../core/utils/id.util';
import { StoreService } from './store.service';
import { ToastService } from './toast.service';
import { I18nService } from './i18n.service';

@Injectable({ providedIn: 'root' })
export class LoanService {
  private store = inject(StoreService);
  private toast = inject(ToastService);
  private i18n = inject(I18nService);

  repayLoan(groupId: string, loanId: string): void {
    const group = this.store.getGroup(groupId);
    if (!group) return;

    const loanRecord = group.loans.find((l) => l.id === loanId);
    if (!loanRecord || loanRecord.status === 'repaid') return;

    this.store.updateGroup(groupId, (g) => {
      const now = new Date().toISOString();
      const loans = g.loans.map((l) =>
        l.id === loanId ? { ...l, status: 'repaid' as const, remainingBalance: 0, repaidAt: now } : l,
      );

      const historyEntry: HistoryItem = {
        id: createId('hist'),
        groupId,
        type: 'loan_repaid',
        month: loanRecord.month,
        titleKey: 'event.loanRepaid.title',
        titleParams: { name: loanRecord.memberName },
        descriptionKey: 'event.loanRepaid.desc',
        descriptionParams: { amount: loanRecord.amount },
        timestamp: now,
        amount: loanRecord.amount,
      };

      return { ...g, loans, history: [historyEntry, ...g.history] };
    });

    this.toast.success(
      this.i18n.t('toast.loanRepaidTitle'),
      this.i18n.t('toast.loanRepaidMessage', { amount: this.i18n.formatCurrency(loanRecord.amount) }),
    );
  }
}
