interface historicThingyRecord {
    mac: string
    humidity: number
    fwVersion: number
    rssi: number
    temperature: number
    co2_ppm: number
    battery: number
    packetCount: number
    timestamp: number
    latitude: number
    longitude: number
}

type HistoricThingies = Record<string, {
    thingy: {
        id: number
        name: string
        description: string
        mac: string
        image: string
    }
    locations: Record<number, [number, number]>
    metadata: Record<number, {
        packetCount: number
        humidity: number
        rssi: number
        temperature: number
        co2_ppm: number
        battery: number
    }>
}>;

export type { historicThingyRecord, HistoricThingies };
