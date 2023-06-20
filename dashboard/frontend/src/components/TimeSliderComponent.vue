<template>
    <div class="bg-white relative rounded-md shadow-md p-2 overflow-hidden">
        <div class="absolute h-full w-full inset-0 bg-sky-200/30 cursor-not-allowed z-10" :hidden="minTime !== 0"></div>
        <div id="timesliderWrapper" class="max-w-xs flex relative m-2">
            <div id="timesliderL" class="h-10 bg-black w-0.5 relative rounded-full">
                <div class="-ml-1.5 w-2 mt-2 h-6 border border-black rounded-l-sm bg-white shadow-md"></div>
            </div>
            <div id="timesliderR" class="h-10 bg-black w-0.5 relative rounded-full">
                <div class="w-2 mt-2 h-6 border border-black rounded-r-sm bg-white shadow-md"></div>
            </div>
            <div class="h-[0.05rem] bg-black w-full absolute self-center"></div>
            <div class="-ml-0.5 bg-sky-600/50 h-8 self-center" :style="selectionClasses"></div>
        </div>
        <div class="flex">
            <div class="text-xs text-gray-400">{{ formatDate(true) }}</div>
            <div class="text-xs text-gray-400 ml-auto">{{ formatDate(false) }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, Ref } from 'vue';
import gsap from 'gsap';
import draggable from 'gsap/Draggable';
import { useHistoricalMapStore } from '@stores/historicalMapStore';

const timesliderL: Ref<draggable | null> = ref(null);
const timesliderR: Ref<draggable | null> = ref(null);
const selectionClasses = ref('');
const sliderTimeMin = ref(0);
const sliderTimeMax = ref(0);
gsap.registerPlugin(draggable);
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

onMounted(() => {
    timesliderL.value = draggable.create('#timesliderL', {
        type: 'x',
        bounds: document.getElementById('timesliderWrapper'),
        onDragEnd: function () {
            updateBounds(false);
            emitNewTime();
        },
        onDrag: onDrag,
    })[0];

    timesliderR.value = draggable.create('#timesliderR', {
        type: 'x',
        bounds: document.getElementById('timesliderWrapper'),
        onDragEnd: function () {
            updateBounds(false);
            emitNewTime();
        },
        onDrag: onDrag,
    })[0];

    gsap.to('#timesliderR', {
        x: (document.getElementById('timesliderWrapper')?.clientWidth ?? 0) - 8,
        duration: 0,
        onComplete: function () {
            onDrag();
            updateBounds();
            onDrag();
            updateBounds();
        },
    });

    window.addEventListener('resize', function () {
        updateBounds(true);
    });
});

function updateBounds(sticky = false) {
    if (timesliderL.value === null || timesliderR.value === null) return;

    timesliderL.value.applyBounds({ minX: 0, maxX: timesliderR.value.x - 2 });
    timesliderL.value.update(true, sticky);

    timesliderR.value.applyBounds({
        minX: timesliderL.value.x + 2,
        maxX:
            (document.getElementById('timesliderWrapper')?.clientWidth ?? 0) -
            2 * (document.getElementById('timesliderR')?.clientWidth ?? 0),
    });
    timesliderR.value.update(true, sticky);
}

function onDrag() {
    if (timesliderL.value === null || timesliderR.value === null) return;

    const selectionSize = timesliderR.value.x - timesliderL.value.x;

    selectionClasses.value = `transform: translateX(${timesliderL.value.x}px); width: ${selectionSize}px;`;

    let percentageL = (timesliderL.value.x / (document.getElementById('timesliderWrapper')?.clientWidth ?? 0)) * 100;
    let percentageR = (timesliderR.value.x / (document.getElementById('timesliderWrapper')?.clientWidth ?? 0)) * 100;

    if (percentageR > 97.5) {
        percentageR = 105;
    }
    if (percentageL < 2.5) {
        percentageL = 0;
    }

    // now use this percentage to calculate a value between te props minTime and maxTime
    sliderTimeMin.value = (percentageL / 100) * (props.maxTime - props.minTime) + props.minTime;
    sliderTimeMax.value = (percentageR / 100) * (props.maxTime - props.minTime) + props.minTime;
    return;
}

function formatDate(isMin = true) {
    let date: Date;

    if (isMin) {
        if (sliderTimeMin.value === 0 || props.minTime > sliderTimeMin.value) {
            date = new Date(props.minTime);
        } else {
            date = new Date(sliderTimeMin.value);
        }
    } else {
        if (sliderTimeMax.value === 0 || props.maxTime < sliderTimeMax.value) {
            date = new Date(props.maxTime);
        } else {
            date = new Date(sliderTimeMax.value);
        }
    }

    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} - ${date.getHours()}:${date.getMinutes()}`;
}

function emitNewTime() {
    histoicalMapStore.isLoading = true;

    let min,
        max = 0;

    if (sliderTimeMin.value === 0) {
        min = props.minTime;
    } else {
        min = Math.max(sliderTimeMin.value, props.minTime);
    }

    if (sliderTimeMax.value === 0) {
        max = props.maxTime;
    } else {
        max = Math.min(sliderTimeMax.value, props.maxTime);
    }

    emit('selectedTime', Math.floor(min / 1000), Math.floor(max / 1000));
}
</script>
