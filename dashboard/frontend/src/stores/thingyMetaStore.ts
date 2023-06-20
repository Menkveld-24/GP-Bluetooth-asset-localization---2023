import { ThingyMetadata, defaultResponse } from '@/consts/interfaces';
import axios, { AxiosResponse } from 'axios';
import { defineStore } from 'pinia';
import { Ref, ref } from 'vue';

export const useThingyMetaStore = defineStore('thingyMetaStore', () => {
    const thingies: Ref<ThingyMetadata[]> = ref([]);

    fetchThingies();

    function fetchThingies(): void {
        console.log('fething thingys');
        axios.get('/api/thingy/all').then((response: AxiosResponse<unknown, unknown>) => {
            const data = response.data as defaultResponse;
            if (data.success) {
                thingies.value = data.data as ThingyMetadata[];
                console.log(thingies.value);
            } else {
                console.log('error fetching thingy metadata!');
            }
        });
    }

    function getByMac(mac: string): ThingyMetadata | undefined {
        return thingies.value.find((thingy) => thingy.mac === mac);
    }

    return { thingies, fetchThingies, getByMac };
});
