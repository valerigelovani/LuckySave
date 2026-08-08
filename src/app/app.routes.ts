import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
    title: 'მთავარი · LuckySave',
  },
  {
    path: 'group',
    loadComponent: () => import('./features/group/group').then((m) => m.GroupPage),
    title: 'ჩემი ჯგუფი · LuckySave',
  },
  {
    path: 'draw',
    loadComponent: () => import('./features/draw/draw').then((m) => m.DrawPage),
    title: 'წილისყრა · LuckySave',
  },
  {
    path: 'history',
    loadComponent: () => import('./features/history/history').then((m) => m.HistoryPage),
    title: 'ისტორია · LuckySave',
  },
  {
    path: 'create-group',
    loadComponent: () => import('./features/create-group/create-group').then((m) => m.CreateGroupPage),
    title: 'ჯგუფის შექმნა · LuckySave',
  },
  {
    path: 'join-group',
    loadComponent: () => import('./features/join-group/join-group').then((m) => m.JoinGroupPage),
    title: 'ჯგუფში გაწევრიანება · LuckySave',
  },
  {
    path: 'loan',
    loadComponent: () => import('./features/loan/loan').then((m) => m.LoanPage),
    title: 'ბანკის დაფარვა · LuckySave',
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile').then((m) => m.ProfilePage),
    title: 'პროფილი · LuckySave',
  },
  { path: '**', redirectTo: 'dashboard' },
];
