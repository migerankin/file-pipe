import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../components/HomePage.vue';

const routes = [
    {
        path: '/',
        redirect: '/home'
    },
    {
        path: '/home',
        name: 'Home',
        component: HomePage
    },
    {
        path: '/favorite',
        name: 'Favorite',
        component: () => import('../components/FavoritePage.vue') // 懒加载
    },
    {
        path: '/settings',
        name: 'Settings',
        component: () => import('../components/SettingsPage.vue') // 懒加载
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router; 