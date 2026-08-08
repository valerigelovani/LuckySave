import { Injectable, inject } from '@angular/core';
import { DrawResult, Group, GroupMember, HistoryItem, Payment } from '../core/models';
import { addDays } from '../core/utils/date.util';
import { createId } from '../core/utils/id.util';
import { shuffle } from '../core/utils/shuffle.util';
import { StoreService } from './store.service';
import { ToastService } from './toast.service';
import { I18nService } from './i18n.service';

@Injectable({ providedIn: 'root' })
export class DrawService {
  private store = inject(StoreService);
  private toast = inject(ToastService);
  private i18n = inject(I18nService);

  eligibleMembers(group: Group): GroupMember[] {
    return group.members.filter((m) => m.isEligible);
  }

  hasDrawnThisMonth(group: Group): boolean {
    return group.draws.some((d) => d.month === group.currentMonth);
  }

  canDraw(group: Group): boolean {
    return group.status === 'active' && !this.hasDrawnThisMonth(group) && this.eligibleMembers(group).length > 0;
  }

  /**
   * The whole payout order is fixed the moment the group fills up (see
   * GroupService.joinGroup), so this looks up who's already scheduled for
   * the current month rather than picking someone fresh. Falls back to a
   * one-off shuffle only if a group somehow has no schedule yet.
   */
  scheduledWinner(group: Group): GroupMember | null {
    const eligible = this.eligibleMembers(group);
    if (eligible.length === 0) return null;

    const scheduledId = group.payoutOrder[group.currentMonth - 1];
    const scheduled = eligible.find((m) => m.id === scheduledId);
    if (scheduled) return scheduled;

    return shuffle(eligible)[0];
  }

  commitDraw(groupId: string, winnerId: string): DrawResult | null {
    const group = this.store.getGroup(groupId);
    if (!group) return null;

    const winner = group.members.find((m) => m.id === winnerId);
    if (!winner) return null;

    const prizeAmount = group.monthlyContribution * group.totalMembers;
    const eligibleIds = this.eligibleMembers(group).map((m) => m.id);
    const now = new Date().toISOString();

    const result: DrawResult = {
      id: createId('draw'),
      groupId,
      month: group.currentMonth,
      winnerId: winner.id,
      winnerName: winner.name,
      winnerInitials: winner.avatarInitials,
      winnerColor: winner.avatarColor,
      prizeAmount,
      eligibleMemberIds: eligibleIds,
      drawDate: now,
    };

    this.store.updateGroup(groupId, (g) => {
      const remainingEligible = g.members.filter((m) => m.isEligible && m.id !== winnerId).length;
      const isFinalMonth = g.currentMonth >= g.durationMonths || remainingEligible === 0;

      const members = g.members.map((m) =>
        m.id === winnerId ? { ...m, hasWon: true, wonMonth: g.currentMonth, isEligible: false } : m,
      );

      const nextMonth = isFinalMonth ? g.currentMonth : g.currentMonth + 1;
      const nextPayments: Payment[] = isFinalMonth
        ? g.payments
        : [
            ...g.payments,
            ...members.map((m) => ({
              id: createId('pay'),
              groupId,
              memberId: m.id,
              month: nextMonth,
              amount: g.monthlyContribution,
              status: 'pending' as const,
              dueDate: addDays(new Date(), 28).toISOString(),
            })),
          ];

      const resetMembers = isFinalMonth ? members : members.map((m) => ({ ...m, currentPaymentStatus: 'pending' as const }));

      const historyEntry: HistoryItem = {
        id: createId('hist'),
        groupId,
        type: 'draw_completed',
        month: g.currentMonth,
        titleKey: 'event.drawCompleted.title',
        titleParams: { name: winner.name },
        descriptionKey: 'event.drawCompleted.desc',
        descriptionParams: { name: winner.name, month: g.currentMonth, amount: prizeAmount },
        timestamp: now,
        amount: prizeAmount,
      };

      return {
        ...g,
        members: resetMembers,
        draws: [...g.draws, result],
        payments: nextPayments,
        currentMonth: nextMonth,
        status: isFinalMonth ? 'completed' : g.status,
        nextDrawDate: isFinalMonth ? g.nextDrawDate : addDays(new Date(), 30).toISOString(),
        history: [historyEntry, ...g.history],
      };
    });

    this.toast.success(this.i18n.t('toast.drawCompleteTitle'), this.i18n.t('toast.drawCompleteMessage', { name: winner.name }));
    return result;
  }
}
