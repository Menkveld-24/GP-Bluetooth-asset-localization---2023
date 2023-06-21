import { ThingyBeacon, ThingyMetadata } from '@/consts/interfaces';
import mapboxgl from 'mapbox-gl';
import { defineStore } from 'pinia';
import { useMapStore } from './mapStore';
import { Ref, ref } from 'vue';

interface liveMarker {
    mac: string;
    beacon: ThingyBeacon;
    metadata: ThingyMetadata;
    marker: mapboxgl.Marker;
    isActive: boolean;
}

export const useLiveMarkerStore = defineStore('liveMarker', () => {
    const markers: Ref<Record<string, liveMarker>> = ref({});
    const mapStore = useMapStore();
    const map: mapboxgl.Map = mapStore.map;

    function addMarker(beacon: ThingyBeacon, metadata: ThingyMetadata): void {
        const isActive = markerIsActive(beacon);

        if (beacon.mac in markers.value) {
            markers.value[beacon.mac].beacon = beacon;
            markers.value[beacon.mac].metadata = metadata;

            // marker is now active but wasnt before or the other way round
            if (isActive !== markers.value[beacon.mac].isActive) {
                console.log('marker changed');
                markers.value[beacon.mac].marker.remove();
                markers.value[beacon.mac].marker = createMarker(beacon);
                markers.value[beacon.mac].isActive = isActive;
            } else {
                markers.value[beacon.mac].marker.setLngLat([beacon.longitude, beacon.latitude]);
            }
            return;
        }

        markers.value[beacon.mac] = {
            mac: beacon.mac,
            beacon: beacon,
            metadata: metadata,
            marker: createMarker(beacon),
            isActive: isActive,
        };
    }

    function showMarkers(): void {
        // @ts-expect-error We don't need the mac
        for (const [mac, marker] of Object.entries(markers.value)) {
            marker.marker.addTo(map);
        }
    }

    function hideMarkers(): void {
        // @ts-expect-error We don't need the mac
        for (const [mac, marker] of Object.entries(markers.value)) {
            marker.marker.remove();
        }
    }

    function createMarker(beacon: ThingyBeacon): mapboxgl.Marker {
        let color = '#666666';
        if (markerIsActive(beacon)) {
            color = '#0369A1';
        }

        return new mapboxgl.Marker({
            color: color,
        })
            .setLngLat([beacon.longitude, beacon.latitude])
            .addTo(map);
    }

    function markerIsActive(beacon: ThingyBeacon): boolean {
        const expiry = Math.floor(Date.now() / 1000) - 10;

        // expiry > beacon.timestamp == expired
        return expiry < beacon.timestamp;
    }

    function goToMarker(mac: string): void {
        if (!(mac in markers.value)) {
            console.log(`marker ${mac} not found`);
            return;
        }

        map.flyTo({
            center: [markers.value[mac].beacon.longitude, markers.value[mac].beacon.latitude],
            zoom: 19,
        });
    }

    function deleteMarker(mac: string) {
        if (!(mac in markers.value)) {
            console.log(`marker ${mac} not found`);
            return;
        }

        markers.value[mac].marker.remove();
        delete markers.value[mac];
    }

    return { showMarkers, addMarker, hideMarkers, markerIsActive, goToMarker, deleteMarker, markers };
});
