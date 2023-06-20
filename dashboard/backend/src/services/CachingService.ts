import redis from '@serviceproviders/RedisServiceProvider';
import config from '@utils/appConfig';

/**
 * Set a json object or array in the cache
 * @date 14-6-2023 - 12:03:32
 *
 * @export
 * @async
 * @param {string} key - The key to set
 * @param {(any[] | object)} data - The data to set
 * @param {number} [ttl=config.cache.ttl] - The time to live in seconds (defaults to what is defined in the appConfig)
 * @returns {Promise<boolean>} - Whether the data was set or not
 */
export async function setJson (key: string, data: any[] | object, ttl: number = config.cache.ttl): Promise<boolean> {
    const result = await redis.call('JSON.SET', key, '$', JSON.stringify(data));
    if (result === 'OK') {
        await redis.expire(key, ttl);
        return true;
    }

    return false;
}

/**
 * Get a json object from the cache
 * @date 14-6-2023 - 12:03:04
 *
 * @export
 * @async
 * @param {string} key - The key to get
 * @returns {Promise<object | any[] | null>} - The data from the cache or null if it doesn't exist
 */
export async function getJson (key: string): Promise<object | any[] | null> {
    const result = await redis.call('JSON.GET', key);
    if (result === null) {
        return null;
    }

    return JSON.parse(result as string);
}

/**
 * Get or set a json object in the cache, if the key is present it returns the value
 * if not it will retrieve the data from the get function and store that in the cache as well as return it
 * @date 14-6-2023 - 12:01:31
 *
 * @export
 * @async
 * @param {string} key - The key to get or set
 * @param {() => Promise<object | any[]> | object | any[]} get - The function to retrieve the data if it's not in the cache
 * @returns {Promise<object>} - The data from the cache or the get function
 */
export async function getOrSetJson (key: string, get: () => Promise<object | any[]> | object | any[]): Promise<object> {
    const result = await getJson(key);
    if (result === null) {
        const data = await get();
        await setJson(key, data);
        return data;
    }

    return result;
}

/**
 * Delete a key from the cache
 * @date 14-6-2023 - 12:00:49
 *
 * @export
 * @async
 * @param {string} key - The key to delete
 * @returns {Promise<boolean>} - Whether the key was deleted or not (or didn't exist)
 */
export async function invalidateKey (key: string): Promise<boolean> {
    const result = await redis.del(key);
    return result === 1;
}
