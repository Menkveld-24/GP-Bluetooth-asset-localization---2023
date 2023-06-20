<template>
    <div class="h-full w-full relative">
        <div id="map" style="position: absolute; top: 0; bottom: 0; width: 100%"></div>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useMapStore } from '@stores/mapStore';

onMounted(() => {
    useMapStore();
});
</script>
