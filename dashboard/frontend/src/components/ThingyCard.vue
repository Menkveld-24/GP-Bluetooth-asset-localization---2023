<template>
    <div class="rounded-lg overflow-hidden shadow-md relative bg-white">
        <img class="object-cover w-full" :src="imageLink" :class="imgSmall ? 'h-20' : 'h-32'" />
        <div :class="blueBarClasses" class="p-4 w-2/3 -mt-7 bg-sky-700 text-white absolute">
            <div class="text-xl truncate">{{ title }}</div>
            <div
                v-if="description !== ''"
                style="line-height: 1"
                :style="descriptionSmall ? 'font-size: xx-small;' : ''"
                :class="{ 'text-sm': !descriptionSmall }"
                class="max-h-10 overflow-hidden mb-1"
            >
                {{ description }}
            </div>
            <slot name="description"></slot>
        </div>
        <div class="px-4 relative" :class="bodyClasses">
            <slot name="body"></slot>
            <router-link
                v-if="inspectButtonId > 0"
                :to="{ name: 'InspectThingy', params: { thingyId: inspectButtonId } }"
                class="hover:cursor-pointer absolute bg-sky-700 text-white right-0 bottom-0 py-1 px-5 min-w-fit rounded-tl-lg"
            >
                Inspect
            </router-link>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ComputedRef, computed } from 'vue';

const blueBarClasses: ComputedRef<string> = computed(() => {
    let classes = '';
    if (!props.hasBody) {
        classes += 'rounded-tr-[4rem] h-full ';
    } else {
        classes += 'rounded-r-full ';
    }
    return classes;
});

const bodyClasses: ComputedRef<string> = computed(() => {
    if (props.hasBody) {
        if (props.description !== '') {
            return 'mt-12 py-2';
        }
        return 'mt-6 py-2';
    }
    return 'mt-6 py-4';
});

const props = defineProps({
    title: {
        type: String,
        required: true,
        default: 'Thingy',
    },
    description: {
        type: String,
        required: false,
        default: '',
    },
    inspectButtonId: {
        type: Number,
        required: false,
        default: -1,
    },
    hasBody: {
        type: Boolean,
        required: false,
        default: true,
    },
    imageLink: {
        type: String,
        required: false,
        default: '',
    },
    imgSmall: {
        type: Boolean,
        required: false,
        default: false,
    },
    descriptionSmall: {
        type: Boolean,
        required: false,
        default: false,
    },
});
</script>
