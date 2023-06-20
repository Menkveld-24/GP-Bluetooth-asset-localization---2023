<template>
    <div v-if="$route.name !== 'Login'" class="h-screen md:p-10 md:flex">
        <div class="md:w-1/3 md:max-w-xs md:text-black text-white">
            <div class="h-full md:mr-7 md:max-w-xs relative">
                <div class="flex md:bg-transparent bg-sky-700 shadow-md md:shadow-none p-2">
                    <div class="text-4xl">Unimatrix 52</div>
                    <div
                        class="duration-500 text-4xl ml-auto show md:hidden hover:cursor-pointer my-auto"
                        :class="{ '-rotate-90': openedDropdown }"
                        @click="openedDropdown = !openedDropdown"
                    >
                        <Menu class="w-full h-8"></Menu>
                    </div>
                </div>
                <div class="">
                    <div class="ml-2 md:ml-0 md:block" :class="{ hidden: !openedDropdown }">
                        <ul class="w-fit">
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
                    <div class="md:absolute bottom-0 w-full p-2 md:p-0">
                        <slot name="infoSection"></slot>
                    </div>
                </div>
            </div>
        </div>
        <div
            class="relative md:min-h-full w-full bg-white rounded-lg shadow-md"
            :class="$route.meta?.showMap ? 'h-full' : 'h-fit'"
        >
            <div class="p-3 h-full relative">
                <slot name="contentSection"></slot>
            </div>
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
