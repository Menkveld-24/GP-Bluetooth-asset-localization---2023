<template>
    <div>
        <div>
            <input
                v-model="name"
                autocomplete="off"
                class="w-full mt-2 px-2 py-1 rounded-md border-2 border-gray-100"
                placeholder="Name for a thingy"
                @input="debouncedCreateThingy"
            />
        </div>
        <div>
            <input
                v-model="description"
                autocomplete="off"
                class="w-full mt-1 px-2 py-1 rounded-md border-2 border-gray-100"
                placeholder="Description for a thingy"
                @input="debouncedCreateThingy"
            />
        </div>
        <div>
            <input
                v-model="mac"
                name="mac"
                autocomplete="off"
                class="w-full mt-1 px-2 py-1 rounded-md border-2 border-gray-100"
                placeholder="AABBCCDDEEFF"
                maxlength="12"
                pattern="[A-Z]{12}"
                @input="debouncedCreateThingy"
            />
        </div>
        <div class="mt-1 flex items-center justify-center">
            <label
                class="relative px-4 py-1 text-white w-full rounded-md cursor-pointer hover:bg-sky-800 duration-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="selectedFile ? 'bg-sky-600' : 'bg-sky-200'"
            >
                <span class="text-base cursor-pointer">{{ selectedFile?.name ?? 'Choose an image' }}</span>
                <input
                    ref="fileInput"
                    type="file"
                    class="cursor-pointer absolute top-0 left-0 w-full h-full opacity-0"
                    accept="image/*"
                    @change="handleFileSelect"
                />
            </label>
        </div>
        <div
            :class="canSubmit ? 'bg-sky-600 cursor-pointer hover:bg-sky-800' : 'bg-sky-200 cursor-not-allowed'"
            class="text-white px-4 py-1 mt-2 rounded-md shadow-md duration-500"
            @click="createThingy"
        >
            Create new Thingy!
        </div>
    </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import { Ref, ref } from 'vue';
import { useToastStore } from '@stores/toastStore';
import debounce from 'lodash/debounce';
import { useThingyMetaStore } from '@stores/thingyMetaStore';

interface defaultResponse {
    message: string;
    errors: string[];
    success: boolean;
    data: unknown;
}

const toaster = useToastStore();
const thingyMetaStore = useThingyMetaStore();
const name: Ref<string> = ref('');
const description: Ref<string> = ref('');
const mac: Ref<string> = ref('');
const selectedFile: Ref<File | null> = ref(null);
const canSubmit: Ref<boolean> = ref(false);

const debouncedCreateThingy = debounce(() => {
    canSubmit.value =
        name.value.length > 0 && description.value.length > 0 && mac.value.length === 12 && selectedFile.value !== null;
}, 100);

function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    selectedFile.value = (target.files as FileList)[0];
    debouncedCreateThingy();
}

async function createThingy(): Promise<void> {
    if (!canSubmit.value) return;

    const formData = new FormData();
    formData.append('name', name.value);
    formData.append('description', description.value);
    formData.append('mac', mac.value);
    formData.append('image', selectedFile.value as File);

    const response = await axios.post('/api/thingy/create', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    response.data as defaultResponse;

    if (response.data.success) {
        toaster.addToast(`Created new thingy: ${name.value}`);
        resetCreateForm();
        thingyMetaStore.fetchThingies();
    } else {
        toaster.addToast(`Failed to create new thingy: ${name.value}`);
        for (const error of response.data.errors) {
            toaster.addToast(error, 5000);
        }
    }
}

function resetCreateForm(): void {
    name.value = '';
    description.value = '';
    mac.value = '';
    canSubmit.value = false;
    selectedFile.value = null;
}
</script>
