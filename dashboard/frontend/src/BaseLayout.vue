<template>
    <div v-if="$route.name !== 'Login'" class="h-screen lg:p-10 lg:flex">
        <div class="lg:w-1/3 lg:max-w-xs lg:text-black text-white">
            <div class="h-full lg:mr-7 lg:max-w-xs relative">
                <div class="flex lg:bg-transparent bg-sky-700 shadow-md lg:shadow-none p-2">
                    <div class="text-4xl">Unimatrix 52</div>
                    <div
                        class="duration-500 text-4xl ml-auto show lg:hidden hover:cursor-pointer my-auto"
                        :class="{ '-rotate-90': openedDropdown }"
                        @click="openedDropdown = !openedDropdown"
                    >
                        <Menu class="w-full h-8"></Menu>
                    </div>
                </div>
                <div class="">
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
                    <div class="lg:absolute bottom-0 w-full p-2 lg:p-0">
                        <slot name="infoSection"></slot>
                    </div>
                </div>
            </div>
        </div>
        <div
            class="relative lg:min-h-full w-full bg-white rounded-lg shadow-md p-3"
            :class="$route.meta?.showMap ? 'h-full' : 'h-fit'"
        >
            <!-- <div class="p-3 h-full relative bg-green-200"> -->
            <slot name="contentSection"></slot>
            <!-- </div> -->
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
