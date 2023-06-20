<template>
    <div hidden>INSPECT PAGE {{ thingyId }}</div>
</template>

<script setup lang="ts">
defineProps({
    thingyId: {
        type: Number,
        required: true,
    },
});
</script>
