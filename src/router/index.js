import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';

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
  ],
});

export default router;
