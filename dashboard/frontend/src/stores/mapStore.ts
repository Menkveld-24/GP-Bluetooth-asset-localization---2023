import mapboxgl from 'mapbox-gl';
import { defineStore } from 'pinia';
import zilverlingFloor5 from '@/assets/floorplan_zilverling_5.json?raw';
import { useMapStatusStore } from '@stores/mapStatusStore';

interface mapSettings {
    div: string;
    style: string;
    center: {
        lat: number;
        lng: number;
    };
    zoom: number;
    bounds: {
        southWest: {
            lat: number;
            lng: number;
        };
        northEast: {
            lat: number;
            lng: number;
        };
    };
}

const mapSettings: mapSettings = {
    div: 'map',
    style: 'mapbox://styles/mapbox/light-v11',
    center: {
        lat: 52.239111993419414,
        lng: 6.856896375943557,
    },
    zoom: 19,
    bounds: {
        southWest: {
            lat: 52.23576347782003,
            lng: 6.815547721833738,
        },
        northEast: {
            lat: 52.24454038329923,
            lng: 6.897850325982788,
        },
    },
};

export const useMapStore = defineStore('map', () => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    const mapStatus = useMapStatusStore();

    const map: mapboxgl.Map = new mapboxgl.Map({
        container: mapSettings.div,
        style: mapSettings.style,
        center: [mapSettings.center.lng, mapSettings.center.lat],
        zoom: mapSettings.zoom,
        maxBounds: [
            [mapSettings.bounds.southWest.lng, mapSettings.bounds.southWest.lat],
            [mapSettings.bounds.northEast.lng, mapSettings.bounds.northEast.lat],
        ],
    });

    map.once('load', () => {
        map.resize();
        map.setZoom(mapSettings.zoom);

        // Add a data source containing GeoJSON data.
        map.addSource('zilverling_5', {
            type: 'geojson',
            data: JSON.parse(zilverlingFloor5),
        });

        map.addLayer({
            id: 'floorplan_5_zilverling',
            type: 'fill',
            source: 'zilverling_5',
            paint: {
                'fill-color': '#888888',
                'fill-outline-color': '#000000',
                'fill-opacity': 0.4,
            },
        });

        // Trigger the mapStore.afterMapReady promise
        mapStatus.finishedMapLoading(true);
    });

    return { map };
});
