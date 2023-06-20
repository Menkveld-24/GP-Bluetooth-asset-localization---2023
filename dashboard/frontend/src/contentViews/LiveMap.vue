<template>
    <div class="absolute top-0">
        <div class="relative mt-3 rounded-md shadow-sm">
            <input
                v-model="search"
                type="text"
                autocomplete="off"
                class="bg-white/60 block pl-2 placeholder w-full rounded-md border-0 py-1.5 pr-10 ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
                placeholder="MAC or name"
            />
            <div v-for="result in searchResults" :key="result.mac" class="gap-2">
                <div
                    class="text-white px-4 py-1 mt-2 rounded-md shadow-md duration-500 bg-sky-600 cursor-pointer hover:bg-sky-800"
                    @click="goToMarker(result.mac)"
                >
                    {{ result.name }}
                    <div class="text-xs ml-1">MAC: {{ result.mac }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useLiveMarkerStore } from '@stores/liveMarkerStore';
import { computed, ref } from 'vue';

const search = ref('');
const markerStore = useLiveMarkerStore();

const searchResults = computed(() => {
    if (search.value === '') return [];

    const results: Array<{ mac: string; name: string }> = [];
    const searchable: string = search.value.toUpperCase();

    for (const [mac, marker] of Object.entries(markerStore.markers)) {
        if (
            results.length < 3 &&
            (marker.mac.toUpperCase().includes(searchable) || marker.metadata.name.toUpperCase().includes(searchable))
        ) {
            results.push({
                mac: marker.mac,
                name: marker.metadata.name,
            });
        }
    }
    return results;
});

function goToMarker(mac: string) {
    markerStore.goToMarker(mac);
    search.value = '';
}
</script>
