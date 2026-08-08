import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
    title: 'Dashboard · LuckySave',
  },
  {
    path: 'group',
    loadComponent: () => import('./features/group/group').then((m) => m.GroupPage),
    title: 'My Group · LuckySave',
  },
  {
    path: 'draw',
    loadComponent: () => import('./features/draw/draw').then((m) => m.DrawPage),
    title: 'Draw · LuckySave',
  },
  {
    path: 'history',
    loadComponent: () => import('./features/history/history').then((m) => m.HistoryPage),
    title: 'History · LuckySave',
  },
  {
    path: 'create-group',
    loadComponent: () => import('./features/create-group/create-group').then((m) => m.CreateGroupPage),
    title: 'Create a Group · LuckySave',
  },
  {
    path: 'join-group',
    loadComponent: () => import('./features/join-group/join-group').then((m) => m.JoinGroupPage),
    title: 'Join a Group · LuckySave',
  },
  {
    path: 'loan',
    loadComponent: () => import('./features/loan/loan').then((m) => m.LoanPage),
    title: 'Loan Coverage · LuckySave',
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile').then((m) => m.ProfilePage),
    title: 'Profile · LuckySave',
  },
  { path: '**', redirectTo: 'dashboard' },
];
