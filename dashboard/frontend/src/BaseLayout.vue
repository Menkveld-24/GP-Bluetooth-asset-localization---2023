<template>
    <div v-if="$route.name !== 'Login'" class="lg:flex h-screen lg:p-10">
        <div class="lg:flex lg:h-full lg:flex-col text-white lg:mr-7 lg:w-1/3 lg:max-w-xs lg:text-black">
            <div class="flex bg-sky-700 p-2 shadow-md lg:bg-transparent lg:shadow-none">
                <div class="text-4xl">Unimatrix 52</div>
                <div
                    class="show my-auto ml-auto text-4xl duration-500 hover:cursor-pointer lg:hidden"
                    :class="{ '-rotate-90': openedDropdown }"
                >
                    <Menu class="h-8 w-full" @click="openedDropdown = !openedDropdown"></Menu>
                </div>
            </div>
            <div class="flex h-full flex-col">
                <div class="ml-2 lg:ml-0 lg:block" :class="{ hidden: !openedDropdown }">
                    <ul class="w-fit text-black">
                        <li>
                            <NavigationButton route-name="Live" :current-route="currentRoute" />
                        </li>
                        <li>
                            <NavigationButton route-name="Thingies" :current-route="currentRoute" />
                        </li>
                        <li>
                            <NavigationButton route-name="Historical" :current-route="currentRoute" />
                        </li>
                    </ul>
                </div>
                <div class="mt-auto w-full p-2">
                    <slot name="infoSection"></slot>
                </div>
            </div>
        </div>
        <div
            class="relative w-full rounded-lg p-3 shadow-md lg:min-h-full bg-white"
            :class="$route.meta?.showMap ? 'h-full' : 'h-fit'"
        >
            <slot name="contentSection"></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import NavigationButton from '@components/NavigationButton.vue';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { Menu } from '@iconoir/vue';

const router = useRoute();
const openedDropdown = ref(false);

const currentRoute = computed(() => {
    return router.name?.toString() ?? 'Unknown';
});
</script>
