import type Thingy from '@models/Thingy';

interface latestBatteryLocation {
    battery: number
    latitude: number
    longitude: number
    timestamp: number
}

interface InspectedThingy {
    mac: string
    thingy: Thingy
    latestRecord: latestBatteryLocation
    packetCount: number
    graphData: {
        battery: graphData[]
        temperature: graphData[]
        humidity: graphData[]
        co2_ppm: graphData[]
    }
}

interface graphData {
    x: number
    y: number
}

export type { latestBatteryLocation, InspectedThingy, graphData };
