import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { StoreService } from '../../../services/store.service';
import { I18nService } from '../../../services/i18n.service';
import { LANG_LABELS, Lang } from '../../../core/i18n/i18n.types';
import { MemberAvatar } from '../member-avatar/member-avatar';
import { ToastContainer } from '../toast-container/toast-container';
import { TranslatePipe } from '../../pipes/translate.pipe';

interface NavItem {
  path: string;
  labelKey: string;
  icon: string;
  primary: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard', labelKey: 'nav.dashboard', icon: 'home', primary: true },
  { path: '/group', labelKey: 'nav.myGroup', icon: 'groups', primary: true },
  { path: '/draw', labelKey: 'nav.draw', icon: 'workspace_premium', primary: true },
  { path: '/history', labelKey: 'nav.history', icon: 'history', primary: true },
  { path: '/profile', labelKey: 'nav.profile', icon: 'person', primary: true },
  { path: '/create-group', labelKey: 'nav.createGroup', icon: 'add_circle', primary: false },
  { path: '/join-group', labelKey: 'nav.joinGroup', icon: 'travel_explore', primary: false },
  { path: '/loan', labelKey: 'nav.loanCoverage', icon: 'account_balance', primary: false },
];

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, MemberAvatar, ToastContainer, TranslatePipe],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShell {
  private store = inject(StoreService);
  i18n = inject(I18nService);

  currentUser = this.store.currentUser;
  navItems = NAV_ITEMS;
  primaryNavItems = NAV_ITEMS.filter((i) => i.primary);
  secondaryNavItems = NAV_ITEMS.filter((i) => !i.primary);
  languages: Lang[] = ['ka', 'en'];

  setLanguage(lang: Lang): void {
    this.i18n.setLanguage(lang);
  }

  langLabel(lang: Lang): string {
    return LANG_LABELS[lang];
  }
}
