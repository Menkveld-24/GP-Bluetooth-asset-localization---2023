const { Redis } = require('ioredis');

const redis = new Redis({
    host: 'localhost',
    port: 6379,
});



(async () => {
    const groupInfo = await redis.xinfo('CONSUMERS', 'teststream', 'testgroup');
    console.log(groupInfo);

    while(true) {
        // const result = await redis.xread('COUNT', 2, 'STREAMS', 'teststream', '0');
        const result = await redis.xreadgroup('GROUP', 'testgroup', 'consoomer1', 'COUNT', 2, 'STREAMS', 'teststream', '>');

        // console.log(result);
        if(result === null) {
            console.log("No data");
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
            // return;
        }

        result[0][1].forEach(async item => {
            console.log(`ID: ${item[0]} and data: ${item[1][1]}`);
            const ack = await redis.xack('teststream', 'testgroup', item[0]);
            // const del = await redis.xdel('teststream', item[0]);
            console.log(`Acked ${ack}`);
        });
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

})().catch(e => {
    console.log(e);
});