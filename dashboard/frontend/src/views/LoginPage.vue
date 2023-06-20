<template>
    <div class="w-full h-screen grid grid-cols-1 items-center">
        <div class="mx-auto p-4 rounded-lg shadow-md bg-white">
            <span class="text-xl">Login</span>
            <!-- <form method="POST" class="w-full" action="/api/auth/login"> -->
            <div>
                <input
                    id="username"
                    v-model="username"
                    required
                    class="mt-2 px-2 py-1 rounded-md border-2 border-gray-100"
                    name="username"
                    placeholder="Username"
                />
            </div>
            <div>
                <input
                    id="password"
                    v-model="password"
                    required
                    class="mt-1 px-2 py-1 rounded-md border-2 border-gray-100"
                    name="password"
                    type="password"
                    placeholder="Password"
                />
            </div>
            <button
                :disabled="isLoading"
                :class="{ 'animate-pulse': isLoading }"
                class="text-white bg-sky-700 px-4 py-1 mt-2 rounded-md shadow-md"
                @click="login"
            >
                Submit
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { defaultResponse } from '@/consts/interfaces';
import router from '@router/index';
import { useToastStore } from '@stores/toastStore';
import axios from 'axios';
import { ref } from 'vue';

const toastStore = useToastStore();
const username = ref('');
const password = ref('');
const isLoading = ref(false);

async function login() {
    isLoading.value = true;
    const response = (
        await axios.post('/api/auth/login', {
            username: username.value,
            password: password.value,
        })
    ).data as defaultResponse;

    if (response.success) {
        router.push({ name: 'Live' });
    } else {
        toastStore.addToast(response.message);
        for (const error of response.errors) {
            toastStore.addToast(error, 5000);
        }
    }
    isLoading.value = false;
}
</script>
