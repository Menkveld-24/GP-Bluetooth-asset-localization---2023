<template>
    <router-link :to="{ name: routeName }" class="group hover:cursor-pointer">
        <div class="pl-3 pt-1">
            {{ routeLookup[routeName] ?? 'Unknown' }}
        </div>
        <div
            class="h-1.5 rounded-sm bg-sky-200 group-hover:bg-sky-800 w-1/3 group-hover:w-2/3 duration-200 transition-all"
            :class="{ 'w-2/3 bg-sky-700': isCurrentRoute }"
        ></div>
    </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const routeLookup: { [key: string]: string } = {
    Live: 'Live map',
    Thingies: 'My thingies',
    Historical: 'Historical data',
};

const props = defineProps({
    routeName: {
        type: String,
        required: true,
        default: 'Unknown',
    },
    currentRoute: {
        type: String,
        required: true,
        default: 'Unknown',
    },
});

const isCurrentRoute = computed(() => {
    return props.routeName === props.currentRoute;
});
</script>
