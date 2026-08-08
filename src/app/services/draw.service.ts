import { Injectable, inject } from '@angular/core';
import { DrawResult, Group, GroupMember, HistoryItem, Payment } from '../core/models';
import { addDays } from '../core/utils/date.util';
import { createId } from '../core/utils/id.util';
import { StoreService } from './store.service';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class DrawService {
  private store = inject(StoreService);
  private toast = inject(ToastService);

  eligibleMembers(group: Group): GroupMember[] {
    return group.members.filter((m) => m.isEligible);
  }

  hasDrawnThisMonth(group: Group): boolean {
    return group.draws.some((d) => d.month === group.currentMonth);
  }

  canDraw(group: Group): boolean {
    return group.status === 'active' && !this.hasDrawnThisMonth(group) && this.eligibleMembers(group).length > 0;
  }

  pickRandomWinner(group: Group): GroupMember | null {
    const eligible = this.eligibleMembers(group);
    if (eligible.length === 0) return null;
    const index = Math.floor(Math.random() * eligible.length);
    return eligible[index];
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
        title: `${winner.name} won the draw`,
        description: `${winner.name} received the month ${g.currentMonth} prize pot of $${prizeAmount}.`,
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

    this.toast.success('Draw complete', `${winner.name} won this month's prize pot.`);
    return result;
  }
}
