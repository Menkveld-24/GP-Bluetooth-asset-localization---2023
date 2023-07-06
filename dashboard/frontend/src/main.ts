import { createApp } from 'vue';
import { createPinia } from 'pinia';
import '@assets/style.css';
import router from '@router/index';
import App from './App.vue';
import 'mapbox-gl/dist/mapbox-gl.css';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

const pinia = createPinia();
const vuetify = createVuetify({
    components,
    directives,
});

createApp(App).use(pinia).use(router).use(vuetify).mount('#app');
