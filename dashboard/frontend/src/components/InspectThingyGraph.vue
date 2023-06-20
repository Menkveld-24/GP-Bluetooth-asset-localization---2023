<template>
    <Line :data="data" :options="options" />
</template>

<script setup lang="ts">
import { InspectedThingy } from '@/interfaces/ThingyInspectInterface';
import 'chartjs-adapter-moment';
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
    ChartOptions,
    ChartData,
    PointElement,
    TimeScale,
    LineElement,
} from 'chart.js';
import { Line } from 'vue-chartjs';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, TimeScale, LineElement);

const props = defineProps({
    rawData: {
        type: Object as () => InspectedThingy['graphData'],
        required: true,
    },
});

const data: ChartData<'line'> = {
    datasets: [
        {
            label: 'Temperature',
            data: props.rawData.temperature,
            pointRadius: 0,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
        },
        {
            label: 'Humidity',
            data: props.rawData.humidity,
            pointRadius: 0,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
        },
        {
            label: 'Battery',
            data: props.rawData.battery,
            pointRadius: 0,
            backgroundColor: 'rgba(255, 206, 86, 0.2)',
            borderColor: 'rgba(255, 206, 86, 1)',
        },
    ],
};

const options: ChartOptions<'line'> = {
    responsive: true,
    scales: {
        x: {
            type: 'time',
            time: {
                displayFormats: {
                    hour: 'MMM D, hA',
                    day: 'MMM D',
                },
                tooltipFormat: 'MMM D, YYYY',
                parser: (value: unknown) => {
                    return Math.floor(parseInt(value as string) * 1000);
                },
            },
        },
        y: {
            min: 0,
            max: 100,
        },
    },
    elements: {
        point: {
            radius: 2,
        },
    },
    plugins: {
        decimation: {
            enabled: true,
            algorithm: 'min-max',
        },
        tooltip: {
            callbacks: {
                label: (context) => {
                    const symbol = context.dataset.label === 'Temperature' ? '°C' : '%';
                    return parseFloat(context.formattedValue).toFixed(1) + symbol;
                },
            },
        },
    },
};
</script>
