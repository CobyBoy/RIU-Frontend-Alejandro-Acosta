import { Routes } from '@angular/router';

export const HEROES_ROUTES: Routes = [
  {
    path: '',
    title: 'Heroes | RIU',
    loadComponent: () => import('./pages/hero-list/hero-list').then((m) => m.HeroList),
  },
  {
    path: 'new',
    title: 'Agregar héroe | RIU',
    loadComponent: () => import('./pages/hero-form/hero-form').then((m) => m.HeroForm),
  },
  {
    path: ':id/edit',
    title: 'Editar héroe | RIU',
    loadComponent: () => import('./pages/hero-form/hero-form').then((m) => m.HeroForm),
  }
];
