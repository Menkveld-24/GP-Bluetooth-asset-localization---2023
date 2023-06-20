<template>
    <div>
        <HeatmapSettings v-if="mapStatus.isReady" class="absolute right-0 m-3 top-0" />
        <div class="absolute bottom-0 right-0 mr-6 mb-14">
            <BeaconInfoCard
                v-if="historicalMapStore.currentPointHoverMetadata !== null"
                :battery="metadata()?.battery ?? 0"
                :temperature="metadata()?.temperature ?? 0"
                :co2-p-p-m="metadata()?.co2_ppm ?? 0"
                :rssi="metadata()?.rssi ?? 0"
                :humidity="metadata()?.humidity ?? 0"
                :image="thingy()?.image ?? ''"
                :name="thingy()?.name ?? ''"
                :thingy-id="-1"
                :margin-top="'mt-8'"
            >
                <template #description>
                    <div style="line-height: 1; font-size: xx-small" class="max-h-10 overflow-hidden mb-1">
                        {{ historicalMapStore.currentPointHoverMetadata.mac }}
                        <br />
                        {{ timestamp() }}
                    </div>
                </template>
            </BeaconInfoCard>
        </div>
    </div>
</template>

<script setup lang="ts">
import BeaconInfoCard from '@components/BeaconInfoCard.vue';
import HeatmapSettings from '@components/HeatmapSettings.vue';
import { useHistoricalMapStore } from '@stores/historicalMapStore';
import { useMapStatusStore } from '@stores/mapStatusStore';
import { onBeforeUnmount } from 'vue';

const historicalMapStore = useHistoricalMapStore();
const mapStatus = useMapStatusStore();

function metadata() {
    if (historicalMapStore.currentPointHoverMetadata === null) return null;
    return historicalMapStore.sampleData[historicalMapStore.selectedSampleDuration][
        historicalMapStore.currentPointHoverMetadata.mac
    ].metadata[historicalMapStore.currentPointHoverMetadata.timestamp];
}

function thingy() {
    if (historicalMapStore.currentPointHoverMetadata === null) return null;
    return historicalMapStore.sampleData[historicalMapStore.selectedSampleDuration][
        historicalMapStore.currentPointHoverMetadata.mac
    ].thingy;
}

function timestamp() {
    const unix = Math.floor((historicalMapStore.currentPointHoverMetadata?.timestamp ?? 0) * 1000);
    return new Date(unix).toLocaleString();
}

onBeforeUnmount(() => {
    historicalMapStore.hideAllLayers();
    historicalMapStore.selectedSampleDuration = '';
    historicalMapStore.selectedThingies = [];
});
</script>
