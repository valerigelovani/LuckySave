import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { StoreService } from '../../../services/store.service';
import { MemberAvatar } from '../member-avatar/member-avatar';
import { ToastContainer } from '../toast-container/toast-container';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  primary: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: 'home', primary: true },
  { path: '/group', label: 'My Group', icon: 'groups', primary: true },
  { path: '/draw', label: 'Draw', icon: 'workspace_premium', primary: true },
  { path: '/history', label: 'History', icon: 'history', primary: true },
  { path: '/profile', label: 'Profile', icon: 'person', primary: true },
  { path: '/create-group', label: 'Create Group', icon: 'add_circle', primary: false },
  { path: '/join-group', label: 'Join Group', icon: 'travel_explore', primary: false },
  { path: '/loan', label: 'Loan Coverage', icon: 'account_balance', primary: false },
];

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, MemberAvatar, ToastContainer],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShell {
  private store = inject(StoreService);

  currentUser = this.store.currentUser;
  navItems = NAV_ITEMS;
  primaryNavItems = NAV_ITEMS.filter((i) => i.primary);
  secondaryNavItems = NAV_ITEMS.filter((i) => !i.primary);
}
