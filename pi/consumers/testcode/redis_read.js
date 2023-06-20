const { Redis } = require('ioredis');

const redis = new Redis({
    host: 'localhost',
    port: 6370,
});



(async () => {
    // const groupInfo = await redis.xinfo('CONSUMERS', 'teststream', 'testgroup2');
    // console.log(groupInfo);

    const result = await redis.xpending('ble_packets', 'kafka_data_pusher', '-', '+', 0);
    console.log(result);
    // while(true) {
    //     // const result = await redis.xread('COUNT', 2, 'STREAMS', 'teststream', '0');
    //     const result = await redis.xreadgroup('GROUP', 'testgroup2', 'consoomer2', 'COUNT', 2, 'STREAMS', 'ble_packets', '>');

    //     // console.log(result);
    //     if(result === null) {
    //         console.log("No data");
    //         await new Promise(resolve => setTimeout(resolve, 1000));
    //         continue;
    //         // return;
    //     }

    //     for(const [entryId, data] of result[0][1]) {
    //         const packet = JSON.parse(data[1]);
    //     }

    //     result[0][1].forEach(async item => {
    //         console.log(`ID: ${item[0]} and data: ${item[1][1]}`);
    //         const ack = await redis.xack('teststream', 'testgroup2', item[0]);
    //         // const del = await redis.xdel('teststream', item[0]);
    //         console.log(`Acked ${ack}`);
    //     });
    //     await new Promise(resolve => setTimeout(resolve, 1000));
    // }

})().catch(e => {
    console.log(e);
});