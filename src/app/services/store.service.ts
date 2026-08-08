import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { AppState, Group } from '../core/models';
import { buildSeedState } from '../core/constants/seed-data';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class StoreService {
  private readonly storage = inject(StorageService);
  private readonly state = signal<AppState>(this.storage.load() ?? buildSeedState());

  readonly currentUser = computed(() => this.state().currentUser);
  readonly groups = computed(() => this.state().groups);
  readonly activeGroupId = computed(() => this.state().activeGroupId);
  readonly activeGroup = computed(() => this.groups().find((g) => g.id === this.activeGroupId()));
  readonly myGroups = computed(() =>
    this.groups().filter((g) => g.members.some((m) => m.userId === this.currentUser().id)),
  );

  constructor() {
    effect(() => this.storage.save(this.state()));
  }

  setActiveGroup(groupId: string): void {
    this.state.update((s) => ({ ...s, activeGroupId: groupId }));
  }

  addGroup(group: Group): void {
    this.state.update((s) => ({ ...s, groups: [...s.groups, group] }));
  }

  updateGroup(groupId: string, updater: (group: Group) => Group): void {
    this.state.update((s) => ({
      ...s,
      groups: s.groups.map((g) => (g.id === groupId ? updater(g) : g)),
    }));
  }

  getGroup(groupId: string): Group | undefined {
    return this.groups().find((g) => g.id === groupId);
  }

  resetDemo(): void {
    this.storage.clear();
    this.state.set(buildSeedState());
  }
}
