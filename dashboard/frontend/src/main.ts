import { createApp } from 'vue';
import { createPinia } from 'pinia';
import '@assets/style.css';
import router from '@router/index';
import App from './App.vue';
import 'mapbox-gl/dist/mapbox-gl.css';
import lottie from 'lottie-web';
import { defineElement } from 'lord-icon-element';

const pinia = createPinia();

defineElement(lottie.loadAnimation);
createApp(App).use(pinia).use(router).mount('#app');
