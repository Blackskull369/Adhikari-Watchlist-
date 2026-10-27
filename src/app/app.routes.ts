import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./login/login').then(m => m.Login) },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard),
  },
  {
    path: 'search',
    canActivate: [authGuard],
    loadComponent: () => import('./search/search').then(m => m.Search),
  },
  {
    path: 'search/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./movie-detail/movie-detail').then(m => m.MovieDetail),
  },
  {
    path: 'add-movie',
    canActivate: [authGuard],
    loadComponent: () => import('./add-movie/add-movie').then(m => m.AddMovie),
  },
  {
    path: 'watchlist/edit/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./add-movie/add-movie').then(m => m.AddMovie),
  },
  {
    path: 'watchlist',
    canActivate: [authGuard],
    loadComponent: () => import('./watchlist/watchlist').then(m => m.Watchlist),
  },
  { path: '**', redirectTo: 'login' },
];