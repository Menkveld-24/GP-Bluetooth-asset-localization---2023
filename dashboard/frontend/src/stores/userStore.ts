import axios from 'axios';
import { defaultResponse, userInfo } from '@/consts/interfaces';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Ref } from 'vue';

export const userStore = defineStore('user', () => {
    const user: Ref<userInfo> = ref({
        name: 'unknown',
        authenticated: false,
    });

    let hasFetchedData = false;

    async function init(): Promise<void> {
        if (hasFetchedData) return;
        await fetchAndUpdateUser();
    }

    async function fetchAndUpdateUser(): Promise<void> {
        const response = (await axios.get('/api/user')).data as defaultResponse;
        if (!response.success) return;

        user.value = response.data as userInfo;
        hasFetchedData = true;
        return;
    }

    return { user, init };
});
