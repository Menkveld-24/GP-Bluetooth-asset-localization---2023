import config from '@utils/appConfig';
import { log } from '@utils/logger';
import { Redis } from 'ioredis';

const redis: Redis = new Redis({
    port: config.redis.port,
    host: config.redis.host
});

/**
 * Waits for a connection with redis for 5 times
 * with a second delay between attempts.
 * @date 17-5-2023 - 23:06:22
 *
 * @async
 * @returns {Promise<boolean>}
 */
export async function waitForRedisConnection (): Promise<boolean> {
    log('Checking for redis connection....');
    const connectionAttempts: number = 5;
    const connectionDelay: number = 1000;
    let status: string = redis.status;

    // Attempt a few times to connect to redis
    for (let i: number = 0; i < connectionAttempts; i++) {
        status = redis.status;
        log(`Redis connection status: ${status}`);
        if (status === 'ready') {
            break;
        }
        await new Promise((resolve) => setTimeout(resolve, connectionDelay));
    }

    if (status !== 'ready') {
        throw new Error('Redis connection failed!');
    }

    const ping = await redis.ping();
    log(`Redis ping: ${ping}`);

    return status === 'ready';
}

export default redis;
