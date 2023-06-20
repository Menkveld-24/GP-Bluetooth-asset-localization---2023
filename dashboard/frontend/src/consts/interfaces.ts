export interface defaultResponse {
    message: string;
    errors: string[];
    success: boolean;
    data: any | null;
}

export interface userInfo {
    name: string;
    authenticated: boolean;
}

export interface ThingyMetadata {
    id: number;
    name: string;
    description: string;
    mac: string;
    image: string;
}

export interface ThingyBeacon {
    mac: string;
    humidity: number;
    fwVersion: number;
    rssi: number;
    temperature: number;
    co2_ppm: number;
    battery: number;
    rollover: number;
    timestamp: number;
    latitude: number;
    longitude: number;
}

export type coordinate = [number, number];
export type coordinatesList = Record<number, coordinate>;

export interface timestampIndexes {
    lowestTimestamp: number;
    highestTimestamp: number;
    lowestIndex: number;
    highestIndex: number;
}

export type HistoricThingies = Record<
    string,
    {
        thingy: ThingyMetadata;
        locations: coordinatesList;
        color: string;
        metadata: Record<
            number,
            {
                packetCount: number;
                humidity: number;
                rssi: number;
                temperature: number;
                co2_ppm: number;
                battery: number;
            }
        >;
    }
>;
