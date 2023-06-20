const { Redis } = require('ioredis');

const STREAM = 'ble_packets';

const redis = new Redis({
    host: 'localhost',
    port: 6370,
});

const start = 5;

(async () => {
    for(let i = start; i < start + 5; i++) {
        console.log(new Date().toLocaleString());
        const jsonString = JSON.stringify({
            'mac': 'AABBCCDDEEFF',
            'timestamp': Date.now(),
            'rssi': -50,
            'fwVersion': 1,
            'rollover': i,
            'co2_ppm': 440 + i,
            'humidity': 50.3,
            'temperature': 25.6,
            'battery': Math.round(78 + (i*0.1), 2),
        });
    
        const result = await redis.xadd(STREAM, '*', 'data', jsonString);
        console.log(`Added as ${result}`);
    }

})().catch(e => {
    console.log(e);
});

1686432045
1686432000