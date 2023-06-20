import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '@views/LoginPage.vue';
import LivePage from '@views/LivePage.vue';
import authCheck from '@guards/authGuard';
import ThingyPage from '@views/ThingyPage.vue';
import HistoricalPage from '@views/HistoricalPage.vue';
import ThingyInspectPage from '@views/ThingyInspectPage.vue';
import ThingyInspector from '@contentViews/ThingyInspector.vue';
import ThingyOverview from '@contentViews/ThingyOverview.vue';
import LiveMap from '@contentViews/LiveMap.vue';
import HistoricMap from '@contentViews/HistoricMap.vue';
import HomePage from '@views/HomePage.vue';

const routes = [
    {
        path: '/',
        name: 'Home',
        components: {
            default: HomePage,
        },
        props: true,
        meta: {
            showMap: false,
        },
    },
    {
        path: '/live',
        name: 'Live',
        components: {
            default: LivePage,
            content: LiveMap,
        },
        beforeEnter: authCheck,
        props: true,
        meta: {
            showMap: true,
        },
    },
    {
        path: '/thingies',
        name: 'Thingies',
        components: {
            default: ThingyPage,
            content: ThingyOverview,
        },
        beforeEnter: authCheck,
    },
    {
        path: '/thingy/:thingyId',
        name: 'InspectThingy',
        components: {
            default: ThingyInspectPage,
            content: ThingyInspector,
        },
        props: true,
        beforeEnter: authCheck,
    },
    {
        path: '/historical',
        name: 'Historical',
        components: {
            default: HistoricalPage,
            content: HistoricMap,
        },
        beforeEnter: authCheck,
        meta: {
            showMap: true,
        },
    },
    {
        path: '/login',
        name: 'Login',
        component: LoginPage,
        beforeEnter: authCheck,
        meta: {
            showMap: false,
        },
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
