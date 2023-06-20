<template>
    <div class="p-2">
        <div
            class="z-10 absolute right-3 mt-1 w-fit rounded-full text-white p-1 bg-sky-800 cursor-pointer hover:rotate-90 transition-all duration-500"
            @click="settingsOpen = !settingsOpen"
        >
            <Settings />
        </div>
        <div v-if="settingsOpen" class="transition-all duration-500 p-4 rounded-md shadow-md pt-4 bg-white">
            <div class="mr-4">Heatmap settings</div>
            <div>
                <div class="text-sky-950 text-sm">Intensity</div>
                <input
                    v-model="heatmapSettings.radiusIntensity"
                    typeof="number"
                    type="range"
                    min="1"
                    max="300"
                    @input="updateWeight"
                />
            </div>
            <div>
                <div class="text-sky-950 text-sm">Sensitivity</div>
                <input
                    v-model="heatmapSettings.radiusSensitivity"
                    typeof="number"
                    type="range"
                    min="1"
                    max="150"
                    @input="updateWeight"
                />
            </div>
            <div class="mr-4">Color settings</div>
            <div>
                <div class="text-sky-950 text-sm">Least intense</div>
                <input
                    v-model="heatmapSettings.heatMapColors.least"
                    class="w-full rounded-md overflow-hidden shadow-md"
                    type="color"
                    @change="updateColor"
                />
            </div>
            <div>
                <div class="text-sky-950 text-sm">Mid intense</div>
                <input
                    v-model="heatmapSettings.heatMapColors.mid"
                    class="w-full rounded-md overflow-hidden shadow-md"
                    type="color"
                    @change="updateColor"
                />
            </div>
            <div>
                <div class="text-sky-950 text-sm">Most intense</div>
                <input
                    v-model="heatmapSettings.heatMapColors.highest"
                    class="w-full rounded-md overflow-hidden shadow-md"
                    type="color"
                    @change="updateColor"
                />
            </div>
            <div class="mr-4">Point size</div>
            <div>
                <input
                    v-model="heatmapSettings.pointSize"
                    typeof="number"
                    type="range"
                    min="1"
                    max="15"
                    @input="updatePointSize"
                />
            </div>
            <div class="mr-4">Line thickness</div>
            <div>
                <input
                    v-model="heatmapSettings.lineThickness"
                    typeof="number"
                    type="range"
                    min="1"
                    max="15"
                    @input="updateLineThickness"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Settings } from '@iconoir/vue';
import { useHeatmapSettingsStore } from '@stores/heatMapSettingsStore';
import { useHistoricalMapStore } from '@stores/historicalMapStore';
import { debounce } from 'lodash';
import { ref } from 'vue';

const settingsOpen = ref(false);
const heatmapSettings = useHeatmapSettingsStore();
const historicalMap = useHistoricalMapStore();

const updateColor = debounce(() => {
    historicalMap.updateHeatMapColor();
}, 200);

const updateWeight = debounce(() => {
    historicalMap.updateHeatMapWeights();
}, 200);

const updatePointSize = debounce(() => {
    historicalMap.updatePointSize();
}, 200);

const updateLineThickness = debounce(() => {
    historicalMap.updateLineThickness();
}, 200);
</script>

<style>
.fadesmoothly-enter-active,
.fadesmoothly-leave-active {
    transition: opacity 0.5s ease;
}

.fadesmoothly-enter-from,
.fadesmoothly-leave-to {
    opacity: 0;
}
</style>
