import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useHeatmapSettingsStore = defineStore('heatmapSettingsStore', () => {
    const radiusSensitivity = ref('75');
    const radiusIntensity = ref('63');
    const pointSize = ref('5');
    const lineThickness = ref('2');

    const heatMapColors = ref({
        least: '#d0d1e6',
        mid: '#82b4d2',
        highest: '#1c9099',
    });

    return { radiusIntensity, radiusSensitivity, heatMapColors, pointSize, lineThickness };
});
