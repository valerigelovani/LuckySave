import { Injectable } from '@angular/core';
import { AppState } from '../core/models';
import { STORAGE_KEY } from '../core/constants/app.constants';

@Injectable({ providedIn: 'root' })
export class StorageService {
  load(): AppState | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as AppState;
    } catch {
      return null;
    }
  }

  save(state: AppState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // localStorage unavailable (private mode, quota) — demo continues in-memory.
    }
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
