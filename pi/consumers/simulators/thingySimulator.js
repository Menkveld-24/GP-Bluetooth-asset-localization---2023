const random = require('geojson-random');
const { Redis } = require('ioredis')

// MACS to simulate data for
const MACS = [
    '04955222F451',
    '6F1AA4521E14',
    '32637491178F',
    '37DE05E8F27F',
    '989E21BCB7F7',
    'D1C19A88A341',
    'CDF71D5248BD',
    '46B889C4F75C',
    '9BAC51BEA82B',
    '81FCE9447BE0',
    '5D321373062F',
    'EBF314AC3A37',
    '1F18C64E5FE9',
    '716B2D5970CC',
    'B8A1FBF15C97',
    '6C3C001940C8',
    '7DD0353D5372',
    '5EEF5B23AFEC',
    '345314F7CEB0',
    'F4EEAC315FCA',
    '29C9ECB1DD3D',
    'CC8C9A2D9631',
    '27B92D2F8705',
    '585510BAD65F',
    '085F9DDBD964',
    '8304C36525F7',
    '25995445405A',
    'F39D9C66EC3C',
    '17752DC781C6',
    '44677CF8691A',
    '1C95470BA205',
    'C7A947B07FE3',
    '77220A9CE491',
    '77B5C3DBAFF9',
    '2914FB1629AA',
    '52C2BC4FBCA1',
    '3C708C07F828',
    '8CEBCB9E5E0D',
    '44C19FE0509B',
    '190D6CBD2996',
    'AFF16FF09000',
    'DB0C09B4BAB4',
    '47B8BD819278',
    '3EFADF1C719B',
    '38ABC6C83BCC',
    '312D94A91C1D',
    'D52B6D04BACB',
    '85B19C8246B8',
    '8B4AC0B37326',
    'CEDB85D275CC'
];
// The delay in ms to which to simulate the packets
const INTERVAL = 0;
// The stream to write to
const STREAM = 'ble_packets';
// Pipelining = sending multiple packets into one request, this can drashtically increase the upload speed
// However, it can interfere with the manaegr 
const PIPELINE = true;
// The amount of points to generate per thingy
const POINTS_PER_THINGY = 100;

// Redis connection
const redis = new Redis({
    host: '192.168.1.65',
    port: 6379,
});

let thingys = [];

/**
 * Log a message to the console with a timestamp
 * 
 * @param {string} message 
 * @returns 
 */
function log(message) {
    console.log(`[${new Date().toLocaleString()}] ${message}`);
    return;
}


/**
 * A random thingy simulator instance that creates a random route for a thingy
 * @date 3-7-2023 - 17:23:27
 *
 * @class randomThingy
 * @typedef {randomThingy}
 */
class randomThingy {

    mac = '';
    randomGeoJson = {};
    index = 0;
    startTime = Date.now();

    constructor(mac) {
        this.mac = mac;
        log(`Starting simulator for: ${mac}`);

        // count, number of points, max distance between previous, max turning radius
        // bounding box
        this.randomGeoJson = random.lineString(1, POINTS_PER_THINGY, 0.00001, Math.PI/8, [
            6.858067765495795, // East
            52.23960444559103, // North
            6.855604668219012, // West
            52.23875182951615, // South
        ]);
    }

    
    /**
     * Return the next available simluated location
     * @date 3-7-2023 - 17:23:59
     *
     * @returns {string} JSON stringified location for Redis
     */
    getNextLocation(){
        const [longtitude, latitude] = this.randomGeoJson.features[0].geometry.coordinates[this.index];
        this.index++;

        return JSON.stringify({
            'mac': this.mac,
            'timestamp': this.startTime + this.index,
            'rssi': this.#randomIntFromInterval(-50, -20),
            'fwVersion': this.#randomIntFromInterval(1, 5),
            'rollover': this.index,
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

    
    /**
     * Get a random Int from a range
     * @date 3-7-2023 - 17:29:43
     *
     * @param {number} min Minimum value (inclusive)
     * @param {number} max Maximum value (inclusive)
     * @returns {number} Random integer
     */
    #randomIntFromInterval(min, max) { // min and max included 
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

    
    /**
     * Get a random Float from a range
     * @date 3-7-2023 - 17:30:48
     *
     * @param {number} min Minimum value (inclusive)
     * @param {number} max Maximum value (inclusive)
     * @returns {number} Random float
     */
    #randomFloatFromInterval(min, max) { // min and max included
        return Math.random() * (max - min) + min
    }
}

for (const mac of MACS) {
    thingys.push(new randomThingy(mac));
}

// Start spoofing as soon as we've connected to Redis
redis.connect(async () => {
    while (true) {
        await spoofLocations();
        if (INTERVAL === 0) continue;

        await new Promise(resolve => setTimeout(resolve, INTERVAL));
    }
});


/**
 * Upload one fake location + packet for each thingy to redis
 * @date 3-7-2023 - 09:10:04
 *
 * @async
 * @returns {Promise<void>}
 */
async function spoofLocations() {
    if (PIPELINE) {
        const pipeline = redis.pipeline();
        for (const thingy of thingys) {
            pipeline.xadd(STREAM, '*', 'data', thingy.getNextLocation());
        }
        await pipeline.exec();
    } else {
        for (const thingy of thingys) {
            await redis.xadd(STREAM, '*', 'data', thingy.getNextLocation());
        }
    }
}
