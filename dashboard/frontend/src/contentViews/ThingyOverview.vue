<template>
    <div class="p-2">
        <div class="mb-2">
            <input
                v-model="search"
                type="text"
                autocomplete="off"
                class="max-w-xs block pl-2 placeholder w-full rounded-md border-0 py-1.5 pr-10 ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
                placeholder="MAC or name"
                @input="filterThingies"
            />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            <template v-for="thingy in thingyStore.thingies">
                <ThingyCard
                    v-if="!isSearching || (isSearching && searchResults.indexOf(thingy.id) !== -1)"
                    :key="thingy.mac"
                    :title="thingy.name"
                    :description="thingy.name"
                    :image-link="'/api/images/' + thingy.image"
                    :inspect-button-id="thingy.id"
                    :has-body="false"
                />
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import ThingyCard from '@components/ThingyCard.vue';
import { useThingyMetaStore } from '@stores/thingyMetaStore';
import { Ref, ref } from 'vue';
import { debounce } from 'lodash';

const thingyStore = useThingyMetaStore();

const search = ref('');
const isSearching = ref(false);
const searchResults: Ref<number[]> = ref([]);

const filterThingies = debounce(() => {
    if (search.value === '') {
        searchResults.value = [];
        isSearching.value = false;
        return;
    }
    isSearching.value = true;

    const results: number[] = [];
    const searchable: string = search.value.toUpperCase();

    for (const [mac, thingy] of Object.entries(thingyStore.thingies)) {
        if (
            results.length < 3 &&
            (thingy.mac.toUpperCase().includes(searchable) || thingy.name.toUpperCase().includes(searchable))
        ) {
            results.push(thingy.id);
        }
    }

    searchResults.value = results;
});
</script>
