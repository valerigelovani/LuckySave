import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppShell } from './shared/components/app-shell/app-shell';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AppShell],
  template: `<app-shell></app-shell>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
