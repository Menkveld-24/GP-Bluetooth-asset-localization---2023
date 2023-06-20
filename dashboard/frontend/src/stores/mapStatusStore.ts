import { defineStore } from 'pinia';
import { Ref, ref } from 'vue';

export const useMapStatusStore = defineStore('mapReady', () => {
    // Helper functions so that we can await the map to be ready
    let finishedMapLoading: (value: boolean | PromiseLike<boolean>) => void;

    const isReady: Ref<boolean> = ref(false);

    const afterMapReady = new Promise((resolve) => {
        finishedMapLoading = resolve;
    }).then(() => {
        isReady.value = true;
    });

    // @ts-expect-error this is true
    return { finishedMapLoading, isReady, afterMapReady };
});
