<template>
    <div class="rounded-md p-2 shadow-md" :class="{ 'cursor-not-allowed': minTime === maxTime }">
        <v-range-slider
            v-model="sliderValue"
            strict
            :min="minTime"
            :max="maxTime"
            color="#0284c7"
            thumb-color="#075985"
            :disabled="minTime === maxTime"
            @end="emitNewTime()"
        ></v-range-slider>
        <div class="flex">
            <div class="text-xs text-gray-400">{{ formatDate(true) }}</div>
            <div class="text-xs text-gray-400 ml-auto">{{ formatDate(false) }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useHistoricalMapStore } from '@stores/historicalMapStore';
import { watch } from 'vue';

const sliderValue = ref([0, 0]);
const histoicalMapStore = useHistoricalMapStore();

const props = defineProps({
    minTime: {
        type: Number,
        required: true,
    },
    maxTime: {
        type: Number,
        required: true,
    },
});

const emit = defineEmits(['selectedTime']);

watch(
    () => props.minTime,
    (newMin, oldMin) => {
        console.log(sliderValue.value, props.minTime, props.maxTime);

        if (oldMin === 0 || sliderValue.value[0] < newMin) {
            sliderValue.value[0] = newMin;
        }
    }
);

watch(
    () => props.maxTime,
    (newMax, oldMax) => {
        console.log(sliderValue.value, props.minTime, props.maxTime);

        if (oldMax === 0 || sliderValue.value[1] > newMax) {
            sliderValue.value[1] = newMax;
        }
    }
);

function formatDate(isMin = true) {
    let date: Date;

    if (isMin) {
        if (sliderValue.value[0] === 0 || props.minTime > sliderValue.value[0]) {
            date = new Date(props.minTime);
        } else {
            date = new Date(sliderValue.value[0]);
        }
    } else {
        if (sliderValue.value[1] === 0 || props.maxTime < sliderValue.value[1]) {
            date = new Date(props.maxTime);
        } else {
            date = new Date(sliderValue.value[1]);
        }
    }

    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} - ${date.getHours()}:${date.getMinutes()}`;
}

function emitNewTime() {
    console.log('new time ');
    histoicalMapStore.isLoading = true;

    let min,
        max = 0;

    if (sliderValue.value[0] === 0) {
        min = props.minTime;
    } else {
        min = Math.max(sliderValue.value[0], props.minTime);
    }

    if (sliderValue.value[1] === 0) {
        max = props.maxTime;
    } else {
        max = Math.min(sliderValue.value[1], props.maxTime);
    }

    emit('selectedTime', Math.floor(min / 1000), Math.floor(max / 1000));
}
</script>
