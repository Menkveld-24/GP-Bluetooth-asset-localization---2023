<template>
    <div ref="popupContent">
        <BeaconInfoCard
            :battery="props.marker.beacon.battery"
            :co2-p-p-m="props.marker.beacon.co2_ppm"
            :humidity="props.marker.beacon.humidity"
            :image="props.marker.metadata.image"
            :mac="props.marker.mac"
            :name="props.marker.metadata.name"
            :rssi="props.marker.beacon.rssi"
            :temperature="props.marker.beacon.temperature"
            :thingy-id="props.marker.metadata.id"
        />
    </div>
</template>

<script setup lang="ts">
import { ThingyBeacon, ThingyMetadata } from '@/consts/interfaces';
import mapboxgl from 'mapbox-gl';
import { PropType, onMounted, ref } from 'vue';
import BeaconInfoCard from './BeaconInfoCard.vue';

interface liveMarker {
    mac: string;
    beacon: ThingyBeacon;
    metadata: ThingyMetadata;
    marker: mapboxgl.Marker;
}

const props = defineProps({
    marker: {
        type: Object as PropType<liveMarker>,
        required: true,
    },
});

const popupContent = ref<HTMLDivElement>();

onMounted(() => {
    props.marker.marker.setPopup(
        // eslint-disable-next-line
        // @ts-ignore
        new mapboxgl.Popup().setDOMContent(popupContent.value)
    );
});
</script>
