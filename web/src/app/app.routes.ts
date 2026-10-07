import { Routes } from '@angular/router';

/** Every feature is lazy-loaded so each one ships as its own bundle. */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes').then((m) => m.dashboardRoutes),
  },
  {
    path: 'users',
    loadChildren: () => import('./features/users/users.routes').then((m) => m.usersRoutes),
  },
  {
    path: 'players',
    loadChildren: () => import('./features/players/players.routes').then((m) => m.playersRoutes),
  },
  {
    path: 'teams',
    loadChildren: () => import('./features/teams/teams.routes').then((m) => m.teamsRoutes),
  },
  {
    path: 'tournaments',
    loadChildren: () =>
      import('./features/tournaments/tournaments.routes').then((m) => m.tournamentsRoutes),
  },
  {
    path: 'matches',
    loadChildren: () => import('./features/matches/matches.routes').then((m) => m.matchesRoutes),
  },
  {
    path: 'live-scoring',
    loadChildren: () =>
      import('./features/live-scoring/live-scoring.routes').then((m) => m.liveScoringRoutes),
  },
  {
    path: 'statistics',
    loadChildren: () =>
      import('./features/statistics/statistics.routes').then((m) => m.statisticsRoutes),
  },
  {
    path: 'feed',
    loadChildren: () => import('./features/social/social.routes').then((m) => m.socialRoutes),
  },
  {
    path: 'communities',
    loadChildren: () =>
      import('./features/communities/communities.routes').then((m) => m.communitiesRoutes),
  },
  {
    path: 'events',
    loadChildren: () => import('./features/events/events.routes').then((m) => m.eventsRoutes),
  },
  {
    path: 'notifications',
    loadChildren: () =>
      import('./features/notifications/notifications.routes').then((m) => m.notificationsRoutes),
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.adminRoutes),
  },
  { path: '**', redirectTo: 'dashboard' },
];
