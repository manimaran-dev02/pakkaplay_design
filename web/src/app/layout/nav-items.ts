export interface NavItem {
  path: string;
  label: string;
}

/** Provisional navigation until the design in docs/design/ defines the real structure. */
export const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/matches', label: 'Matches' },
  { path: '/live-scoring', label: 'Live scoring' },
  { path: '/tournaments', label: 'Tournaments' },
  { path: '/teams', label: 'Teams' },
  { path: '/players', label: 'Players' },
  { path: '/statistics', label: 'Statistics' },
  { path: '/feed', label: 'Feed' },
  { path: '/communities', label: 'Communities' },
  { path: '/events', label: 'Events' },
  { path: '/notifications', label: 'Notifications' },
  { path: '/admin', label: 'Admin' },
];
