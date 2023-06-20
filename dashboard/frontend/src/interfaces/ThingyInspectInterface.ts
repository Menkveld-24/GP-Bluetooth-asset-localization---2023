interface latestBatteryLocation {
    battery: number;
    latitude: number;
    longitude: number;
    timestamp: number;
}

interface InspectedThingy {
    mac: string;
    thingy: {
        id: number;
        name: string;
        description: string;
        mac: string;
        image: string;
        createdAt: Date;
        updatedAt: Date;
    };
    latestRecord: latestBatteryLocation;
    packetCount: number;
    graphData: {
        battery: graphData[];
        temperature: graphData[];
        humidity: graphData[];
        co2_ppm: graphData[];
    };
}

interface graphData {
    x: number;
    y: number;
}

export type { latestBatteryLocation, InspectedThingy, graphData };
