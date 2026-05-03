import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./admin/login/login.component').then((m) => m.LoginComponent) },
  {
    path: 'admin',
    loadComponent: () => import('./admin/shell/shell.component').then((m) => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./admin/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'section/:section',
        loadComponent: () =>
          import('./admin/section-manager/section-manager.component').then((m) => m.SectionManagerComponent),
      },
    ],
  },
  { path: '**', redirectTo: '/admin' },
];
