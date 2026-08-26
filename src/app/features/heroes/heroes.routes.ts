import { Routes } from '@angular/router';

export const HEROES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/hero-list/hero-list').then((m) => m.HeroList),
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/hero-form/hero-form').then((m) => m.HeroForm),
  },
];
