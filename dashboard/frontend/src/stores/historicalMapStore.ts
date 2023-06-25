import { HistoricThingies, defaultResponse, timestampIndexes, coordinatesList, coordinate } from '@/consts/interfaces';
import axios from 'axios';
import { defineStore } from 'pinia';
import { useToastStore } from './toastStore';
import chroma from 'chroma-js';
import { Ref, ref } from 'vue';
import { useMapStore } from './mapStore';
import { useHeatmapSettingsStore } from './heatMapSettingsStore';

export const useHistoricalMapStore = defineStore('historicalMap', () => {
    const sampleData: { [sampleDuration: string]: HistoricThingies } = {};

    const toastStore = useToastStore();
    const mapStore = useMapStore();
    const mapSettings = useHeatmapSettingsStore();
    const isLoading = ref(false);
    const selectedThingies: Ref<string[]> = ref([]);
    const selectedSampleDuration = ref('');
    const pointsLayerVisible = ref(false);
    const heatMapLayerVisible = ref(false);
    const lineLayerVisible = ref(false);
    const availableSampleDurations = ['1m', '5m', '10m', '15m', '30m'];
    const currentPointHoverMetadata: Ref<{
        mac: string;
        timestamp: number;
    } | null> = ref(null);

    let lastMinMaxTimestamp = {
        min: 0,
        max: 0,
    };

    async function getSampledData(sampleDuration: string): Promise<HistoricThingies> {
        if (!availableSampleDurations.includes(sampleDuration)) {
            toastStore.addToast(`Invalid sample duration ${sampleDuration}`);
            return {};
        }
        startLoading();

        // temporarily save the current visualization visibilities to restore them later
        const showedLine = lineLayerVisible.value;
        const showedPoints = pointsLayerVisible.value;
        const showedHeatmap = heatMapLayerVisible.value;

        hideAllLayers();

        // Clear the heatmap layer
        if (hasHeatMapLayer()) {
            const source = mapStore.map.getSource(heatMapLayerName()) as mapboxgl.GeoJSONSource;
            source.setData({
                type: 'FeatureCollection',
                features: [],
            });
        }

        // Load the new data if not in cache
        selectedSampleDuration.value = sampleDuration;
        if (!sampleData[sampleDuration]) {
            sampleData[sampleDuration] = await retrieveBySample(sampleDuration);
            const sampleCount = Object.keys(sampleData[sampleDuration]).length;

            const colors = chroma.scale('Paired').mode('lab').colors(sampleCount);

            for (const [index, mac] of Object.keys(sampleData[sampleDuration]).entries()) {
                sampleData[sampleDuration][mac].color = colors[index];
            }
        }

        console.log('old min max', lastMinMaxTimestamp.min, lastMinMaxTimestamp.max);
        // regenerating previously selected maps
        for (const mac of selectedThingies.value) {
            displayNewThingy(mac, lastMinMaxTimestamp.min, lastMinMaxTimestamp.max);
        }

        // restoring previously selected map visibilities
        if (showedLine) {
            showLineLayers();
        }

        if (showedPoints) {
            showPointsLayers();
        }

        if (showedHeatmap) {
            showHeatMapLayer();
        }

        stopLoading();
        return sampleData[sampleDuration];
    }

    async function retrieveBySample(sample: string): Promise<HistoricThingies> {
        const response = (await axios.get(`/api/historical/sample/${sample}`)).data as defaultResponse;
        if (!response.success) {
            toastStore.addToast(`Error retrieving data for sample ${sample}`);
        }

        return response.data;
    }

    async function toggleThingy(mac: string, minTime: number, maxTime: number) {
        startLoading();
        // thingy not yet selected, create or show
        if (selectedThingies.value.indexOf(mac) === -1) {
            selectedThingies.value.push(mac);
            displayNewThingy(mac, minTime, maxTime);
        } else {
            selectedThingies.value.splice(selectedThingies.value.indexOf(mac), 1);
            hideExistingThingy(mac, minTime, maxTime);
        }
        stopLoading();
    }

    function displayNewThingy(mac: string, minTime: number, maxTime: number) {
        const coordinates = sampleData[selectedSampleDuration.value][mac].locations;
        const indexes = findIndexes(coordinates, minTime, maxTime);
        console.log(indexes);
        const metaPoints = generateMetaPoints(coordinates, indexes, mac);

        createLineLayer(mac, indexes, coordinates);
        createPointsLayer(mac, metaPoints);

        createHeatMapLayer(mac, metaPoints, minTime, maxTime);

        if (lineLayerVisible.value) {
            showLineLayers(mac);
        }

        if (pointsLayerVisible.value) {
            showPointsLayers(mac);
        }

        if (heatMapLayerVisible.value) {
            showHeatMapLayer();
        }
    }

    function startLoading() {
        isLoading.value = true;
    }

    function stopLoading() {
        isLoading.value = false;
    }

    function getCoordinates(coordinates: coordinatesList, indexes: timestampIndexes): coordinate[] {
        return Object.values(coordinates).slice(indexes.lowestIndex, indexes.highestIndex + 1);
    }

    function createHeatMapLayer(
        metaPointsMac: string,
        metaPoints: GeoJSON.Feature<GeoJSON.Point>[],
        minTime: number,
        maxTime: number
    ) {
        const heatPoints: GeoJSON.Feature<GeoJSON.Point>[] = metaPoints;

        // Create the heatpoints for all selected thingies
        for (const mac of selectedThingies.value) {
            if (mac === metaPointsMac) continue;

            const coordinates = sampleData[selectedSampleDuration.value][mac].locations;
            const indexes = findIndexes(coordinates, minTime, maxTime);
            const metaPoints = generateMetaPoints(coordinates, indexes, mac);
            heatPoints.push(...metaPoints);
        }

        const geoJson: GeoJSON.GeoJSON = {
            type: 'FeatureCollection',
            features: heatPoints,
        };

        // update or create the source
        const source = mapStore.map.getSource(heatMapLayerName()) as mapboxgl.GeoJSONSource;
        if (source === undefined) {
            mapStore.map.addSource(heatMapLayerName(), {
                type: 'geojson',
                data: geoJson,
            });
        } else {
            source.setData(geoJson);
        }

        const layer = mapStore.map.getLayer(heatMapLayerName()) as mapboxgl.HeatmapLayer;
        if (layer !== undefined) return;

        //add layer here
        mapStore.map.addLayer({
            id: heatMapLayerName(),
            type: 'heatmap',
            source: heatMapLayerName(),
            maxzoom: 24,
            layout: {
                visibility: heatMapLayerVisible.value ? 'visible' : 'none',
            },
            paint: {
                // increase weight as diameter breast height increases
                'heatmap-weight': {
                    property: 'packetCount',
                    stops: [
                        [1, 0],
                        [62, 1],
                    ],
                },
                // increase intensity as zoom level increases
                'heatmap-intensity': {
                    stops: [
                        [1, 0],
                        [60, 7],
                    ],
                },
                // assign color values be applied to points depending on their density
                'heatmap-color': [
                    'interpolate',
                    ['linear'],
                    ['heatmap-density'],
                    0,
                    'rgba(236,222,239,0)',
                    0.2,
                    mapSettings.heatMapColors.least,
                    0.5,
                    mapSettings.heatMapColors.mid,
                    0.8,
                    mapSettings.heatMapColors.highest,
                ],
                // increase radius as zoom increases
                'heatmap-radius': {
                    property: 'packetCount',
                    stops: [
                        [1, 1],
                        [parseInt(mapSettings.radiusSensitivity), parseInt(mapSettings.radiusIntensity)],
                    ],
                },
                // decrease opacity to transition into the circle layer
                'heatmap-opacity': 1,
            },
        });
    }

    function updateHeatMapColor() {
        const layer = mapStore.map.getLayer(heatMapLayerName()) as mapboxgl.HeatmapLayer;
        if (layer === undefined) return;

        startLoading();
        mapStore.map.setPaintProperty(
            heatMapLayerName(),
            'heatmap-color',
            [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                0,
                'rgba(236,222,239,0)',
                0.2,
                mapSettings.heatMapColors.least,
                0.5,
                mapSettings.heatMapColors.mid,
                0.8,
                mapSettings.heatMapColors.highest,
            ],
            {
                validate: false,
            }
        );
        stopLoading();
    }

    function updateHeatMapWeights() {
        const layer = mapStore.map.getLayer(heatMapLayerName()) as mapboxgl.HeatmapLayer;
        if (layer === undefined) return;

        startLoading();
        mapStore.map.setPaintProperty(heatMapLayerName(), 'heatmap-radius', {
            property: 'packetCount',
            stops: [
                [1, 1],
                [parseInt(mapSettings.radiusSensitivity), parseInt(mapSettings.radiusIntensity)],
            ],
        });
        stopLoading();
    }

    function updatePointSize() {
        startLoading();
        for (const mac of selectedThingies.value) {
            mapStore.map.setPaintProperty(pointsLayerName(mac), 'circle-radius', [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                Math.floor(parseInt(mapSettings.pointSize) * 1.5),
                parseInt(mapSettings.pointSize),
            ]);
        }
        stopLoading();
    }

    function updateLineThickness() {
        startLoading();
        for (const mac of selectedThingies.value) {
            mapStore.map.setPaintProperty(lineLayerName(mac), 'line-width', parseInt(mapSettings.lineThickness));
        }
        stopLoading();
    }

    function createPointsLayer(mac: string, metaPoints: GeoJSON.Feature<GeoJSON.Point>[]) {
        const geoJson: GeoJSON.GeoJSON = {
            type: 'FeatureCollection',
            features: metaPoints,
        };

        // update or create the source
        const source = mapStore.map.getSource(pointsLayerName(mac)) as mapboxgl.GeoJSONSource;
        if (source === undefined) {
            mapStore.map.addSource(pointsLayerName(mac), {
                type: 'geojson',
                data: geoJson,
            });
        } else {
            source.setData(geoJson);
        }

        const layer = mapStore.map.getLayer(pointsLayerName(mac)) as mapboxgl.CircleLayer;
        if (layer !== undefined) return;

        mapStore.map.addLayer({
            id: pointsLayerName(mac),
            type: 'circle',
            source: pointsLayerName(mac),
            layout: {
                visibility: pointsLayerVisible.value ? 'visible' : 'none',
            },
            paint: {
                'circle-color': sampleData[selectedSampleDuration.value][mac].color,
                'circle-radius': [
                    'case',
                    ['boolean', ['feature-state', 'hover'], false],
                    Math.floor(parseInt(mapSettings.pointSize) * 1.5),
                    parseInt(mapSettings.pointSize),
                ],
            },
        });

        registerFeatureDisplay(pointsLayerName(mac));
    }

    function createLineLayer(mac: string, indexes: timestampIndexes, coordinates: coordinatesList) {
        const geoJson: GeoJSON.Feature<GeoJSON.LineString> = {
            type: 'Feature',
            properties: {
                mac: mac,
            },
            geometry: {
                type: 'LineString',
                coordinates: getCoordinates(coordinates, indexes),
            },
        };

        // update or create the source
        const source = mapStore.map.getSource(lineLayerName(mac)) as mapboxgl.GeoJSONSource;
        if (source === undefined) {
            mapStore.map.addSource(lineLayerName(mac), {
                type: 'geojson',
                data: geoJson,
            });
        } else {
            source.setData(geoJson);
        }

        const layer = mapStore.map.getLayer(lineLayerName(mac)) as mapboxgl.LineLayer;
        if (layer !== undefined) return;

        mapStore.map.addLayer({
            id: lineLayerName(mac),
            type: 'line',
            source: lineLayerName(mac),
            layout: {
                visibility: lineLayerVisible.value ? 'visible' : 'none',
            },
            paint: {
                'line-color': sampleData[selectedSampleDuration.value][mac].color,
                'line-width': parseInt(mapSettings.lineThickness),
            },
        });
    }

    function hideExistingThingy(mac: string, minTime: number, maxTime: number) {
        if (hasLineLayer(mac)) {
            hideLineLayers(mac);
        }

        if (hasPointsLayer(mac)) {
            hidePointsLayers(mac);
        }

        // Recreate the heatmap layer but without the currently deselected thingy
        createHeatMapLayer('', [], minTime, maxTime);
    }

    function generateMetaPoints(coordinates: Record<number, [number, number]>, indexes: timestampIndexes, mac: string) {
        const metaPoints: GeoJSON.Feature<GeoJSON.Point>[] = [];

        // const coords = Object.values(coordinates).slice(indexes.lowestIndex, indexes.highestIndex + 1);
        const rawMetadata = Object.entries(sampleData[selectedSampleDuration.value][mac].metadata).slice(
            indexes.lowestIndex,
            indexes.highestIndex + 1
        );

        for (const [unix, metadata] of rawMetadata) {
            metaPoints.push({
                type: 'Feature',
                properties: {
                    mac: mac,
                    packetCount: metadata.packetCount,
                },
                geometry: {
                    type: 'Point',
                    // @ts-expect-error it's fine
                    coordinates: coordinates[unix],
                },
                id: unix,
            });
        }
        return metaPoints;
    }

    function pointsLayerName(mac: string, sample?: string): string {
        if (sample === undefined) {
            sample = selectedSampleDuration.value;
        }

        return `${sample}_${mac}_points`;
    }

    function heatMapLayerName(sample?: string): string {
        if (sample === undefined) {
            sample = selectedSampleDuration.value;
        }

        return `${sample}_heatmap`;
    }

    function lineLayerName(mac: string, sample?: string): string {
        if (sample === undefined) {
            sample = selectedSampleDuration.value;
        }

        return `${sample}_${mac}_line`;
    }

    function togglePointsLayer() {
        startLoading();
        if (pointsLayerVisible.value) {
            hidePointsLayers();
        } else {
            showPointsLayers();
        }
        stopLoading();
    }

    function toggleLineLayer() {
        startLoading();
        if (lineLayerVisible.value) {
            hideLineLayers();
        } else {
            showLineLayers();
        }
        stopLoading();
    }

    function toggleHeatMapLayer() {
        startLoading();
        if (heatMapLayerVisible.value) {
            hideHeatMapLayer();
        } else {
            showHeatMapLayer();
        }
        stopLoading();
    }

    function hasPointsLayer(mac: string): boolean {
        return mapStore.map.getLayer(pointsLayerName(mac)) !== undefined;
    }

    function hasHeatMapLayer(): boolean {
        return mapStore.map.getLayer(heatMapLayerName()) !== undefined;
    }

    function hasLineLayer(mac: string): boolean {
        return mapStore.map.getLayer(lineLayerName(mac)) !== undefined;
    }

    function deletePointsLayers(mac?: string) {
        if (mac === undefined) {
            for (const mac of selectedThingies.value) {
                deletePointsLayers(mac);
            }
            return;
        }

        if (!hasPointsLayer(mac)) return;

        mapStore.map.removeLayer(pointsLayerName(mac));
        mapStore.map.removeSource(pointsLayerName(mac));
    }

    function deleteLineLayers(mac?: string) {
        if (mac === undefined) {
            for (const mac of selectedThingies.value) {
                deleteLineLayers(mac);
            }
            return;
        }

        if (!hasLineLayer(mac)) return;

        mapStore.map.removeLayer(lineLayerName(mac));
        mapStore.map.removeSource(lineLayerName(mac));
    }

    function hidePointsLayers(mac?: string) {
        if (mac === undefined) {
            for (const mac of selectedThingies.value) {
                hidePointsLayers(mac);
            }
            pointsLayerVisible.value = false;
            return;
        }

        changeLayerVisibility(pointsLayerName(mac), hasPointsLayer(mac), 'none');
    }

    function showPointsLayers(mac?: string) {
        if (mac === undefined) {
            for (const mac of selectedThingies.value) {
                showPointsLayers(mac);
            }
            pointsLayerVisible.value = true;
            return;
        }

        changeLayerVisibility(pointsLayerName(mac), hasPointsLayer(mac), 'visible');
    }

    type layerVisibilty = 'visible' | 'none';
    function changeLayerVisibility(layerName: string, hasLayer: boolean, visibility: layerVisibilty) {
        if (!hasLayer) return;

        mapStore.map.setLayoutProperty(layerName, 'visibility', visibility);
    }

    function hideLineLayers(mac?: string) {
        if (mac === undefined) {
            for (const mac of selectedThingies.value) {
                hideLineLayers(mac);
            }
            lineLayerVisible.value = false;
            return;
        }

        changeLayerVisibility(lineLayerName(mac), hasLineLayer(mac), 'none');
    }

    function showLineLayers(mac?: string) {
        if (mac === undefined) {
            for (const mac of selectedThingies.value) {
                showLineLayers(mac);
            }
            lineLayerVisible.value = true;
            return;
        }

        changeLayerVisibility(lineLayerName(mac), hasLineLayer(mac), 'visible');
    }

    function hideHeatMapLayer() {
        changeLayerVisibility(heatMapLayerName(), hasHeatMapLayer(), 'none');
        heatMapLayerVisible.value = false;
    }

    function showHeatMapLayer() {
        changeLayerVisibility(heatMapLayerName(), hasHeatMapLayer(), 'visible');
        heatMapLayerVisible.value = true;
    }

    /**
     * This registers the feature for hovering (showing the popup and hiding it)
     *
     * @param layer layer name
     */
    function registerFeatureDisplay(layer: string) {
        mapStore.map.on('mousemove', layer, (e) => {
            if (e.features === undefined) return;

            if (e.features.length > 0) {
                currentPointHoverMetadata.value = {
                    mac: e.features[0].properties?.mac,
                    timestamp: e.features[0].id as number,
                };
                mapStore.map.setFeatureState(
                    {
                        source: layer,
                        id: e.features[0].id,
                    },
                    {
                        hover: true,
                    }
                );
            }
        });
        mapStore.map.on('mouseleave', layer, () => {
            if (currentPointHoverMetadata.value !== null) {
                mapStore.map.setFeatureState(
                    {
                        source: layer,
                        id: currentPointHoverMetadata.value.timestamp,
                    },
                    {
                        hover: false,
                    }
                );
                currentPointHoverMetadata.value = null;
            }
        });
    }

    function findIndexes(
        locations: Record<number, [number, number]>,
        minReferenceTimestamp: number,
        maxReferenceTimestamp: number
    ): timestampIndexes {
        let lowestTimestamp = 0;
        let highestTimestamp = 0;
        let lowestIndex = 0;
        let highestIndex = 0;

        const keys = Object.keys(locations);

        if (keys.length === 0) {
            return { lowestTimestamp, highestTimestamp, lowestIndex, highestIndex };
        }

        if (maxReferenceTimestamp === 0) {
            highestTimestamp = parseInt(keys.at(-1) ?? '9999999999999999');
            highestIndex = keys.length - 1;
        } else if (maxReferenceTimestamp > parseInt(keys.at(-1) ?? '9999999999999999')) {
            highestTimestamp = parseInt(keys.at(-1) ?? '9999999999999999');
            highestIndex = keys.length - 1;
        }

        for (let i = 0; i < keys.length; i++) {
            if (lowestTimestamp === 0) {
                if (minReferenceTimestamp <= parseInt(keys[i])) {
                    lowestTimestamp = parseInt(keys[i]);
                    lowestIndex = i;
                    if (highestTimestamp !== 0) {
                        break;
                    }
                }
                continue;
            }
            if (maxReferenceTimestamp <= parseInt(keys[i])) {
                highestIndex = i;
                highestTimestamp = parseInt(keys[i]);
                break;
            }
        }

        return { lowestTimestamp, highestTimestamp, lowestIndex, highestIndex };
    }

    function hideAllLayers() {
        hideHeatMapLayer();
        deletePointsLayers();
        deleteLineLayers();
    }

    function redrawSelectedThingies(minTime: number, maxTime: number) {
        startLoading();
        lastMinMaxTimestamp = { min: minTime, max: maxTime };
        console.log('new min max', minTime, maxTime);
        for (const mac of selectedThingies.value) {
            displayNewThingy(mac, minTime, maxTime);
        }

        stopLoading();
    }

    return {
        getSampledData,
        isLoading,
        selectedThingies,
        toggleThingy,
        selectedSampleDuration,
        redrawSelectedThingies,
        currentPointHoverMetadata,
        sampleData,
        hideAllLayers,
        pointsLayerVisible,
        lineLayerVisible,
        heatMapLayerVisible,
        togglePointsLayer,
        toggleLineLayer,
        toggleHeatMapLayer,
        updateHeatMapColor,
        updateHeatMapWeights,
        updatePointSize,
        updateLineThickness,
    };
});
