import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./login/login').then(m => m.Login) },
  { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard) },
  { path: 'search', loadComponent: () => import('./search/search').then(m => m.Search) },
  { path: 'add-movie', loadComponent: () => import('./add-movie/add-movie').then(m => m.AddMovie) },
  { path: 'watchlist', loadComponent: () => import('./watchlist/watchlist').then(m => m.Watchlist) },
  { path: '**', redirectTo: 'login' },
];
