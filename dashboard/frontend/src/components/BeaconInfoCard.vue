<template>
    <ThingyCard
        class="-mx-3 -my-4 w-64"
        :title="name"
        :has-body="true"
        :image-link="'/api/images/' + image"
        :inspect-button-id="thingyId"
        :img-small="true"
        :description-small="true"
    >
        <template #description>
            <slot name="description"></slot>
        </template>
        <template #body>
            <div class="text-sky-800/50 text-xs" :class="marginTop">
                <div class="grid grid-cols-3 w-full gap-2">
                    <div class="flex my-auto">
                        <BatteryFull v-if="battery > 90" class="mr-1 h-5 w-fit" />
                        <Battery75 v-else-if="battery > 67" class="mr-1 h-5 w-fit" />
                        <Battery50 v-else-if="battery > 40" class="mr-1 h-5 w-fit" />
                        <Battery25 v-else-if="battery > 20" class="mr-1 h-5 w-fit" />
                        <BatteryEmpty v-else class="mr-1 h-5 w-fit" />
                        <div class="my-auto">{{ battery.toFixed(1) }}%</div>
                    </div>
                    <div class="flex">
                        <TemperatureLow class="my-auto h-5 w-fit" />
                        <div class="my-auto">
                            {{ temperature.toFixed(1) }}
                        </div>
                    </div>
                    <div class="flex">
                        <DashboardDots class="h-5 my-auto w-fit" />
                        <div class="my-auto ml-0.5">
                            {{ co2PPM.toFixed(0) }}
                        </div>
                    </div>
                </div>
                <div class="grid grid-cols-3 my-1">
                    <div class="flex">
                        <RssFeed class="h-5 my-auto w-fit mr-0.5" />
                        <div class="my-auto">{{ rssi.toFixed(1) }}</div>
                    </div>
                    <div class="flex">
                        <DropletHalf class="h-5 my-auto w-fit mr-0.5" />
                        <div class="my-auto">{{ humidity.toFixed(1) }}%</div>
                    </div>
                </div>
            </div>
        </template>
    </ThingyCard>
</template>

<script setup lang="ts">
import ThingyCard from './ThingyCard.vue';
import {
    TemperatureLow,
    Battery50,
    Battery25,
    BatteryEmpty,
    BatteryFull,
    Battery75,
    RssFeed,
    DropletHalf,
    DashboardDots,
} from '@iconoir/vue';

defineProps({
    thingyId: {
        type: Number,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    battery: {
        type: Number,
        required: true,
    },
    temperature: {
        type: Number,
        required: true,
    },
    co2PPM: {
        type: Number,
        required: true,
    },
    rssi: {
        type: Number,
        required: true,
    },
    humidity: {
        type: Number,
        required: true,
    },
    marginTop: {
        type: String,
        required: false,
        default: 'mt-2',
    },
});
</script>
