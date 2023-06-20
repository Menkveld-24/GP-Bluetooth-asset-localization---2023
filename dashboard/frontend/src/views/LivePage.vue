<template>
    <div>
        <MarkerPopup v-for="marker in markerStore.markers" :key="`${marker.mac}_${marker.isActive}`" :marker="marker" />
    </div>
</template>

<script setup lang="ts">
import { ThingyBeacon, defaultResponse } from '@/consts/interfaces';
import MarkerPopup from '@components/MarkerPopup.vue';
import { useLiveMarkerStore } from '@stores/liveMarkerStore';
import { useMapStatusStore } from '@stores/mapStatusStore';
import { useMapStore } from '@stores/mapStore';
import { useThingyMetaStore } from '@stores/thingyMetaStore';
import { useToastStore } from '@stores/toastStore';
import axios from 'axios';
import { onBeforeUnmount, onMounted } from 'vue';

const mapStore = useMapStore();
const markerStore = useLiveMarkerStore();
const thingyMetaStore = useThingyMetaStore();
const toastStore = useToastStore();
const mapStatus = useMapStatusStore();

// eslint-disable-next-line
let updateInterval: NodeJS.Timer;

onMounted(async () => {
    markerStore.showMarkers();
    mapStore.map.resize();
});

mapStatus.afterMapReady.then(() => {
    fetchLastLocations();
    updateInterval = setInterval(async () => {
        await fetchLastLocations();
    }, 2000);
});

onBeforeUnmount(() => {
    clearInterval(updateInterval);
    markerStore.hideMarkers();
});

async function fetchLastLocations(): Promise<void> {
    const response = await axios.get('api/live/last-locations');

    const data = (response.data as defaultResponse).data as ThingyBeacon[];

    for (const marker of data) {
        const metaData = thingyMetaStore.getByMac(marker.mac);
        if (!metaData) {
            toastStore.addToast(`Thingy with mac ${marker.mac} not found in database!`);
            continue;
        }

        markerStore.addMarker(marker, metaData);
    }
}
</script>
