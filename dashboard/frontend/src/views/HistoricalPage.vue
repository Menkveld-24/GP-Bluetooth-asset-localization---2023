<template>
    <div class="relative">
        <transition name="fade">
            <div
                v-show="historicalMap.isLoading"
                class="transition-all duration-1000 absolute h-full w-full inset-0 border-2 rounded-md cursor-wait z-40 flex"
            >
                <div class="absolute inset-0 w-full cursor-wait rounded-md border-2 bg-white/60 animate-pulse"></div>
                <DataTransferDown class="m-auto z-50" />
            </div>
        </transition>
        <label class="text-sm text-sky-950">Sample by</label>
        <div class="flex justify-between text-center shadow-md rounded-md bg-white mb-2">
            <div
                v-for="sampleDuration in availableSampleDurations"
                :key="sampleDuration"
                :class="[
                    sampleDuration === historicalMap.selectedSampleDuration
                        ? 'bg-sky-600 text-white'
                        : 'text-sky-600/50',
                ]"
                class="w-full mt-2 cursor-pointer rounded-md px-1 py-2 duration-500 hover:bg-sky-800 hover:text-white"
                @click="selectSample(sampleDuration)"
            >
                {{ sampleDuration }}
            </div>
        </div>

        <label class="text-sm text-sky-950">Visualizations</label>
        <div class="flex justify-between text-center shadow-md rounded-md bg-white gap-2 mb-2">
            <div
                :class="[historicalMap.heatMapLayerVisible ? 'bg-sky-600 text-white' : 'text-sky-600/50']"
                class="w-full mt-2 cursor-pointer rounded-md px-1 py-2 duration-500 hover:bg-sky-800 hover:text-white"
                @click="historicalMap.toggleHeatMapLayer()"
            >
                Heatmap
            </div>
            <div
                :class="[historicalMap.pointsLayerVisible ? 'bg-sky-600 text-white' : 'text-sky-600/50']"
                class="w-full mt-2 cursor-pointer rounded-md px-1 py-2 duration-500 hover:bg-sky-800 hover:text-white"
                @click="historicalMap.togglePointsLayer()"
            >
                Points
            </div>
            <div
                :class="[historicalMap.lineLayerVisible ? 'bg-sky-600 text-white' : 'text-sky-600/50']"
                class="w-full mt-2 cursor-pointer rounded-md px-1 py-2 duration-500 hover:bg-sky-800 hover:text-white"
                @click="historicalMap.toggleLineLayer()"
            >
                Line
            </div>
        </div>

        <label class="text-sm text-sky-950">Thingies</label>
        <div class="shadow-md rounded-md p-2 gap-2 h-64 overflow-y-scroll bg-white flex flex-wrap relative mb-2">
            <div
                class="absolute h-full w-full inset-0 bg-sky-200/30 cursor-not-allowed z-10"
                :hidden="historicalMap.selectedSampleDuration !== ''"
            ></div>
            <div class="flex h-10">
                <input
                    v-model="search"
                    type="text"
                    autocomplete="off"
                    class="h-full bg-white/60 block pl-2 placeholder w-full rounded-md border-0 py-1.5 pr-10 ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
                    placeholder="MAC or name"
                />
                <button
                    class="min-w-fit px-1 ml-2 text-center h-full bg-sky-600 rounded-md px-1 duration-500 hover:bg-sky-800 text-white"
                    @click="deselectAll"
                >
                    Hide all
                </button>
            </div>
            <div
                v-for="thingy in searchResults"
                :key="thingy.thingy.mac"
                class="h-fit group mt-2 w-fit cursor-pointer rounded-md text-white shadow-md duration-500 overflow-hidden"
                @click="historicalMap.toggleThingy(thingy.thingy.mac, filterMinTime, filterMaxTime)"
            >
                <div class="flex">
                    <div
                        :class="{ 'bg-gray-400': historicalMap.selectedThingies.indexOf(thingy.thingy.mac) === -1 }"
                        :style="
                            historicalMap.selectedThingies.indexOf(thingy.thingy.mac) !== -1
                                ? `background-color: ${thingy.color};`
                                : ''
                        "
                        class="w-fit rounded-r-full transition-all group-hover:w-full group-hover:rounded-none group-hover:pr-4"
                    >
                        <div class="z-40 p-2">
                            {{ thingy.thingy.name }}
                        </div>
                    </div>
                    <div class="w-4 group-hover:w-0 transition-all"></div>
                </div>
            </div>
        </div>

        <label class="text-sm text-sky-950">Date</label>
        <TimeSliderComponent :min-time="minTime" :max-time="maxTime" @selected-time="selectedTimeFilter" />
    </div>
</template>

<script setup lang="ts">
import TimeSliderComponent from '@components/TimeSliderComponent.vue';
import { HistoricThingies } from '@/consts/interfaces';
import { useHistoricalMapStore } from '@stores/historicalMapStore';
import { computed, ref, Ref } from 'vue';
import { DataTransferDown } from '@iconoir/vue';

const availableSampleDurations = ['1m', '5m', '10m', '15m', '30m'];
const historicalMap = useHistoricalMapStore();
const sampledData: Ref<HistoricThingies> = ref({});

const minTime = ref(0);
const maxTime = ref(0);

const filterMinTime = ref(0);
const filterMaxTime = ref(0);

const search = ref('');

async function selectSample(sampleDuration: string) {
    sampledData.value = await historicalMap.getSampledData(sampleDuration);
    updateMinMaxTime();
}

function updateMinMaxTime() {
    let min = Infinity;
    let max = 0;

    // @ts-expect-error We don't need the mac
    for (const [mac, thingy] of Object.entries(sampledData.value)) {
        min = Math.min((Object.keys(thingy.locations).at(0) ?? Infinity) as number, min);
        max = Math.max((Object.keys(thingy.locations).at(-1) ?? 0) as number, max);
    }

    minTime.value = Math.floor(min * 1000);
    maxTime.value = Math.floor(max * 1000);
}

const searchResults = computed(() => {
    if (search.value === '') return sampledData.value;

    const results: HistoricThingies = {};
    const searchable: string = search.value.toUpperCase();

    for (const [mac, thingy] of Object.entries(sampledData.value)) {
        if (mac.toUpperCase().includes(searchable) || thingy.thingy.name.toUpperCase().includes(searchable)) {
            results[mac] = thingy;
        }
    }

    return results;
});

function selectedTimeFilter(min: number, max: number) {
    filterMinTime.value = min;
    filterMaxTime.value = max;
    historicalMap.redrawSelectedThingies(min, max);
}

function deselectAll() {
    historicalMap.hideAllLayers();
    historicalMap.selectedThingies = [];
}
</script>

<style>
.fade-enter-active {
    transition: opacity 0.1s ease;
}
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
