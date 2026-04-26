import type { AppTabRoute } from '@synkos/client';

export const appTabRoutes: AppTabRoute[] = [
  {
    path: '/',
    name: 'home',
    icon: 'home',
    labelKey: 'tabs.home',
    component: () => import('src/features/home/pages/HomePage.vue'),
  },
  // Add your app's tab routes here
];
