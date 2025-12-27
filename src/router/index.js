import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import NfcScanner from '@/components/NfcScanner.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/item',
      name: 'item',
      component: () => import('@/views/ItemView.vue'),
    },
    {
      path: '/category',
      name: 'category',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('@/views/CategoryView.vue'),
    },
    {
      path: '/place',
      name: 'place',
      component: () => import('@/views/PlaceView.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue'),
    },
    {
      path: '/entity/add',
      name: 'addEntity',
      component: () => import('@/views/AddEntityView.vue'),
      props: (route) => ({ initialType: route.query.initialType || null }),
    },
    {
      path: '/entity/:id/view',
      name: 'viewEntity',
      component: () => import('@/views/AddEntityView.vue'),
      props: (route) => ({ mode: 'view', entityId: route.params.id }),
    },
    {
      path: '/entity/:id/edit',
      name: 'editEntity',
      component: () => import('@/views/AddEntityView.vue'),
      props: (route) => ({ mode: 'edit', entityId: route.params.id }),
    },
    {
      // Zmieniamy ścieżkę, aby przyjmowała opcjonalny parametr ID
      // Znak zapytania '?' oznacza, że parametr nie jest obowiązkowy (można wejść bez taga)
      path: '/scanner/:tagId?',
      name: 'NfcScanner',
      component: () => import('../components/NfcScanner.vue'),
      props: true, // To ważne! Dzięki temu tagId trafi do propsów komponentu
    },
  ],
});

export default router;
