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
            label: 'CO2 PPM',
            data: props.rawData.co2_ppm,
            pointRadius: 0,
            backgroundColor: 'rgba(123, 56, 132, 0.2)',
            borderColor: 'rgba(123, 56, 132, 1)',
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
                    return context.formattedValue + 'ppm';
                },
            },
        },
    },
};
</script>
