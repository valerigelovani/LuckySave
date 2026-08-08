import { ChangeDetectionStrategy, Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { DrawResult, GroupMember } from '../../core/models';
import { SectionHeader } from '../../shared/components/section-header/section-header';
import { MemberAvatar } from '../../shared/components/member-avatar/member-avatar';
import { CountdownDisplay } from '../../shared/components/countdown-display/countdown-display';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { GroupService } from '../../services/group.service';
import { DrawService } from '../../services/draw.service';
import { I18nService } from '../../services/i18n.service';

type DrawPhase = 'idle' | 'spinning' | 'revealed';

interface ConfettiPiece {
  id: number;
  left: number;
  color: string;
  delay: number;
  duration: number;
  rotation: number;
  size: number;
}

const CONFETTI_COLORS = ['#5B4FE9', '#17C27F', '#D99A2B', '#E5484D', '#2E86DE', '#C6448D'];

@Component({
  selector: 'app-draw-page',
  standalone: true,
  imports: [RouterLink, MatIconModule, SectionHeader, MemberAvatar, CountdownDisplay, EmptyState, TranslatePipe],
  templateUrl: './draw.html',
  styleUrl: './draw.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrawPage implements OnDestroy {
  private groupService = inject(GroupService);
  private drawService = inject(DrawService);
  i18n = inject(I18nService);
  private timers: ReturnType<typeof setTimeout>[] = [];

  group = this.groupService.activeGroup;

  phase = signal<DrawPhase>('idle');
  spinMember = signal<GroupMember | null>(null);
  spinTick = signal(0);
  winner = signal<GroupMember | null>(null);
  freshResult = signal<DrawResult | null>(null);
  confetti = signal<ConfettiPiece[]>([]);

  eligible = computed(() => {
    const g = this.group();
    return g ? this.drawService.eligibleMembers(g) : [];
  });

  ineligible = computed(() => {
    const g = this.group();
    return g ? g.members.filter((m) => !m.isEligible) : [];
  });

  canDraw = computed(() => {
    const g = this.group();
    return g ? this.drawService.canDraw(g) : false;
  });

  hasDrawnThisMonth = computed(() => {
    const g = this.group();
    return g ? this.drawService.hasDrawnThisMonth(g) : false;
  });

  thisMonthResult = computed<DrawResult | null>(() => {
    const g = this.group();
    if (!g) return null;
    return g.draws.find((d) => d.month === g.currentMonth) ?? null;
  });

  isCompleted = computed(() => this.group()?.status === 'completed');

  prizeAmount = computed(() => {
    const g = this.group();
    return g ? this.groupService.estimatedPot(g) : 0;
  });

  blockedReasonKey = computed(() => {
    const g = this.group();
    if (!g) return '';
    if (g.status === 'completed') return 'draw.blockedCompleted';
    if (this.hasDrawnThisMonth()) return 'draw.blockedAlreadyDrawn';
    if (this.eligible().length === 0) return 'draw.blockedNoEligible';
    return '';
  });

  startDraw(): void {
    const group = this.group();
    if (!group || !this.canDraw()) return;

    const winnerMember = this.drawService.pickRandomWinner(group);
    if (!winnerMember) return;

    this.winner.set(null);
    this.freshResult.set(null);
    this.confetti.set([]);
    this.phase.set('spinning');

    const steps = 18;
    const sequence = this.buildSequence(this.eligible(), winnerMember, steps);
    this.runStep(group.id, sequence, 0, steps);
  }

  private buildSequence(eligible: GroupMember[], winner: GroupMember, steps: number): GroupMember[] {
    const sequence: GroupMember[] = [];
    while (sequence.length < steps - 1) {
      const shuffled = [...eligible].sort(() => Math.random() - 0.5);
      sequence.push(...shuffled);
    }
    return [...sequence.slice(0, steps - 1), winner];
  }

  private delayForStep(index: number, steps: number): number {
    const t = index / (steps - 1);
    const eased = 1 - Math.pow(1 - t, 3);
    const fast = 50;
    const slow = 320;
    return fast + eased * (slow - fast);
  }

  private runStep(groupId: string, sequence: GroupMember[], index: number, steps: number): void {
    if (index >= sequence.length) {
      const finalTimer = setTimeout(() => this.finishDraw(groupId, sequence[sequence.length - 1]), 260);
      this.timers.push(finalTimer);
      return;
    }

    this.spinMember.set(sequence[index]);
    this.spinTick.update((v) => v + 1);

    const delay = this.delayForStep(index, steps);
    const timer = setTimeout(() => this.runStep(groupId, sequence, index + 1, steps), delay);
    this.timers.push(timer);
  }

  private finishDraw(groupId: string, winnerMember: GroupMember): void {
    this.winner.set(winnerMember);
    this.phase.set('revealed');
    this.spawnConfetti();
    const result = this.drawService.commitDraw(groupId, winnerMember.id);
    this.freshResult.set(result);
  }

  private spawnConfetti(): void {
    const pieces: ConfettiPiece[] = Array.from({ length: 70 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      delay: Math.random() * 400,
      duration: 2200 + Math.random() * 1400,
      rotation: Math.random() * 360,
      size: 6 + Math.random() * 6,
    }));
    this.confetti.set(pieces);
  }

  resetToIdle(): void {
    this.phase.set('idle');
    this.winner.set(null);
    this.freshResult.set(null);
    this.confetti.set([]);
  }

  ngOnDestroy(): void {
    this.timers.forEach((t) => clearTimeout(t));
  }
}
