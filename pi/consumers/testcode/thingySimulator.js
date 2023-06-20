const random = require('geojson-random');
const { Redis } = require('ioredis')
const fs = require('fs');

const MACS = [
    "AABBCCDDEEFF",
    "BBAACCDDEEFF"
];
const INTERVAL = 2000;
const STREAM = 'ble_packets';

const redis = new Redis({
    host: 'localhost',
    port: 6370,
});

let thingys = [];

function log(message) {
    console.log(`[${new Date().toLocaleString()}] ${message}`);
    return;
}

class randomThingy {

    mac = '';
    randomGeoJson = {};
    index = 0;

    constructor(mac) {
        this.mac = mac;
        log(`Starting simulator for: ${mac}`);

        // count, number of points, max distance between previous, max turning radius
        // bounding box
        this.randomGeoJson = random.lineString(1, 200, 0.00001, Math.PI/8, [
            6.858067765495795, // East
            52.23960444559103, // North
            6.855604668219012, // West
            52.23875182951615, // South
        ]);

        // console.log(this.randomGeoJson.features[0].geometry);
        // save this.randomGeoJson to file
        fs.writeFileSync('randomGeoJson.json', JSON.stringify(this.randomGeoJson));
    }

    getNextLocation(){
        const [longtitude, latitude] = this.randomGeoJson.features[0].geometry.coordinates[this.index];
        this.index++;

        console.log(Math.floor(Date.now() / 1000), new Date());

        return JSON.stringify({
            'mac': this.mac,
            'timestamp': Date.now(),//1686342020000,//'2023-06-09T20:20:20.588Z',//new Date(),
            'rssi': this.#randomIntFromInterval(-50, -20),
            'fwVersion': this.#randomIntFromInterval(1, 5),
            'rollover': this.#randomIntFromInterval(0, 255),
            'co2_ppm': this.#randomIntFromInterval(400, 800),
            'humidity': this.#randomFloatFromInterval(40, 60),
            'temperature': this.#randomFloatFromInterval(20, 30),
            'battery': this.#randomFloatFromInterval(70, 100),
            'location': {
                'latitude': latitude,
                'longitude': longtitude,
            }
        });
    }

    #randomIntFromInterval(min, max) { // min and max included 
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

    #randomFloatFromInterval(min, max) { // min and max included
        return Math.random() * (max - min) + min
    }
}

for (const mac of MACS) {
    thingys.push(new randomThingy(mac));
}

redis.connect(() => {
    setInterval(spoofLocations, INTERVAL);
});

async function spoofLocations() {
    for (const thingy of thingys) {
        log(`Spoofing for: ${thingy.mac}`);
        // console.log(thingy.getNextLocation());
        await redis.xadd(STREAM, '*', 'data', thingy.getNextLocation());
    }
}
