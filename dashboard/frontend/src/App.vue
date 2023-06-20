<template>
    <div>
        <ToastsModal />
        <BaseLayout v-if="['Live', 'Thingies', 'InspectThingy', 'Historical'].indexOf($route.name as string) !== -1">
            <template #infoSection>
                <router-view v-if="mapStatus.isReady" v-slot="{ Component }">
                    <component :is="Component" @reload-children="(newValue: number) => (childKey = newValue)" />
                </router-view>
            </template>

            <template #contentSection>
                <!-- <IndoorMap v-if="$route.meta?.showMap" /> -->
                <keep-alive v-show="$route.meta?.showMap">
                    <IndoorMap />
                </keep-alive>
                <Suspense>
                    <router-view v-if="mapStatus.isReady" :key="childKey" name="content" />
                </Suspense>
            </template>
        </BaseLayout>
        <router-view v-else v-slot="{ Component }">
            <component :is="Component" />
        </router-view>
        <div class="absolute transition-all bottom-0 right-0 flex text-sky-950 text-xs mb-1">
            <div class="py-1 px-2 my-auto">
                @2023 By Menke Veerman as a Graduation Project at the University of Twente
            </div>
            <div class="ml-4 flex hover:bg-sky-800/40 rounded-sm py-1 px-2 duration-200 min-w-fit">
                <GitHub class="h-4 my-auto" />Github
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import BaseLayout from '@/BaseLayout.vue';
import ToastsModal from '@components/ToastsModal.vue';
import { useToastStore } from '@stores/toastStore';
import { ref } from 'vue';
import IndoorMap from '@/contentViews/IndoorMap.vue';
import { useMapStatusStore } from '@stores/mapStatusStore';
import { GitHub } from '@iconoir/vue';

useToastStore();

const mapStatus = useMapStatusStore();
const childKey = ref(Math.random());
</script>
