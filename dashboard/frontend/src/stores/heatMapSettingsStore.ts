import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';

interface heatmapSetting {
    sensitivity: string;
    minimumIntensity: string;
    maximumIntensity: string;
}
interface heatmapSettings {
    weight: heatmapSetting;
    intensity: heatmapSetting;
    radius: heatmapSetting;
}

export const useHeatmapSettingsStore = defineStore('heatmapSettingsStore', () => {
    const pointSize = ref('5');
    const lineThickness = ref('2');

    const heatMapColors = ref({
        least: '#d0d1e6',
        mid: '#82b4d2',
        highest: '#1c9099',
    });

    const heatmapSettings: heatmapSettings = reactive({
        weight: {
            sensitivity: '5',
            minimumIntensity: '4',
            maximumIntensity: '10',
        },
        intensity: {
            sensitivity: '5',
            minimumIntensity: '0.4',
            maximumIntensity: '10',
        },
        radius: {
            sensitivity: '5',
            minimumIntensity: '4',
            maximumIntensity: '10',
        },
    });

    return { heatmapSettings, heatMapColors, pointSize, lineThickness };
});
