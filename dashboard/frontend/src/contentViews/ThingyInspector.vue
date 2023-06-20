<template>
    <div class="lg:flex">
        <div class="overflow-hidden bg-white shadow sm:rounded-lg self-center min-w-max lg:max-w-lg w-full">
            <div class="px-4 py-6 sm:px-6 relative">
                <img class="absolute object-cover inset-0 w-full h-full" :src="`/api/images/${thingy.thingy.image}`" />
                <h3 class="text-base font-semibold leading-7 sticky text-sky-950 bg-white w-fit px-2 rounded-sm">
                    Inspecting thingy #44
                </h3>
            </div>
            <div class="border-t border-gray-100">
                <dl class="divide-y divide-gray-100">
                    <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-sky-950">MAC</dt>
                        <dd class="mt-1 text-sm leading-6 text-sky-800 sm:col-span-2 sm:mt-0">
                            {{ thingy.mac }}
                        </dd>
                    </div>
                    <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-sky-950">Name</dt>
                        <dd class="mt-1 text-sm leading-6 text-sky-800 sm:col-span-2 sm:mt-0">
                            {{ thingy.thingy.name }}
                        </dd>
                    </div>
                    <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-sky-950">Description</dt>
                        <dd class="mt-1 text-sm leading-6 text-sky-800 sm:col-span-2 sm:mt-0">
                            {{ thingy.thingy.description }}
                        </dd>
                    </div>

                    <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-sky-950">Battery</dt>
                        <dd class="mt-1 text-sm leading-6 text-sky-800 sm:col-span-2 sm:mt-0">
                            {{ thingy.latestRecord.battery.toFixed(1) }}%
                        </dd>
                    </div>
                    <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-sky-950">Last seen</dt>
                        <dd class="mt-1 text-sm leading-6 text-sky-800 sm:col-span-2 sm:mt-0">
                            {{ new Date(Math.floor(thingy.latestRecord.timestamp * 1000)).toLocaleString() }} ({{
                                moment(new Date(Math.floor(thingy.latestRecord.timestamp * 1000))).from(
                                    moment(new Date())
                                )
                            }})
                        </dd>
                    </div>
                    <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-sky-950">Last known position</dt>
                        <dd class="mt-1 text-sm leading-6 text-sky-800 sm:col-span-2 sm:mt-0">
                            Lat: {{ thingy.latestRecord.latitude }} - Lng: {{ thingy.latestRecord.longitude }}
                        </dd>
                    </div>
                    <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-sky-950">Packets received</dt>
                        <dd class="mt-1 text-sm leading-6 text-sky-800 sm:col-span-2 sm:mt-0">
                            {{ thingy.packetCount }}
                        </dd>
                    </div>
                    <div class="px-4 py-2 sm:px-6 w-full">
                        <dd
                            class="hover:cursor-pointer hover:bg-opacity-80 text-sm leading-6 text-white mt-0 bg-red-500 ml-auto w-fit p-1 px-3 rounded-md shadow-md"
                            @click="deleteThingy"
                        >
                            Delete
                        </dd>
                    </div>
                </dl>
            </div>
        </div>
        <div class="ml-0 lg:ml-4 w-full">
            <InspectThingyGraph :raw-data="thingy.graphData" />
            <InspectCo2Graph :raw-data="thingy.graphData" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { defaultResponse } from '@/consts/interfaces';
import { InspectedThingy } from '@/interfaces/ThingyInspectInterface';
import InspectCo2Graph from '@components/InspectCo2Graph.vue';
import InspectThingyGraph from '@components/InspectThingyGraph.vue';
import router from '@router/index';
import { useLiveMarkerStore } from '@stores/liveMarkerStore';
import { useThingyMetaStore } from '@stores/thingyMetaStore';
import { useToastStore } from '@stores/toastStore';
import axios from 'axios';
import moment from 'moment';

const toastStore = useToastStore();
const thingyMetaStore = useThingyMetaStore();
const markerStore = useLiveMarkerStore();

const props = defineProps({
    thingyId: {
        type: Number,
        required: true,
    },
});

const response = (await axios.get(`/api/thingy/inspect/${props.thingyId}`)).data as defaultResponse;
if (!response.success) {
    toastStore.addToast(response.message);
    router.push({ name: 'Thingies' });
}
console.log(response.data);

const thingy = response.data as InspectedThingy;

async function deleteThingy() {
    const response = (await axios.post(`/api/thingy/delete/${props.thingyId}`)).data as defaultResponse;
    if (!response.success) {
        toastStore.addToast(response.message);
        router.push({ name: 'Thingies' });
        return;
    }

    toastStore.addToast('Thingy deleted successfully!');
    thingyMetaStore.fetchThingies();
    markerStore.deleteMarker(thingy.mac);

    router.push({ name: 'Thingies' });
}
</script>
