const { Redis } = require('ioredis');
const STREAM = 'ble_packets';

const redis = new Redis({
    host: 'localhost',
    port: 6370,
});

async function waitForRedisConnection(redis)
{    
    //   Checking for redis connection! //
    console.log('Checking for redis connection....');
    const connectionAttempts = 5;
    const connectionDelay = 1000;
    let status = redis.status;

    // Attempt a few times to connect to redis
    for(let i = 0; i < connectionAttempts; i++) {
        status = redis.status;
        console.log(`Redis connection status: ${status}`);
        if(redis.status === 'ready') {
            break;
        }
        await new Promise(resolve => setTimeout(resolve, connectionDelay));
    }

    if(status !== 'ready'){
        process.exit(-1);
    }

    const ping = await redis.ping();
    console.log(`Redis ping: ${ping}`);
    /////////////////////////////////////

    return status === 'ready';
}

(async () => {
    await waitForRedisConnection(redis);
    const allMessageIds = await redis.xrange(STREAM, '-', '+');
    console.log(allMessageIds);

    for (const [id] of allMessageIds) {
        console.log(id);
        const isAcknowledgedByGroup1 = await redis.xpending(STREAM, 'consumers', '-', '+', '1', id);
        console.log(isAcknowledgedByGroup1);
    }

})().catch(e => {
    console.log(e);
});