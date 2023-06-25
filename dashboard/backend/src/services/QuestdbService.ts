import { type HistoricThingies, type historicThingyRecord } from '@app/interfaces/HistoricThingyInterface';
import { type graphData, type latestBatteryLocation } from '@app/interfaces/ThingyInspectInterface';
import type Thingy from '@app/interfaces/ThingyMetadataInterface';
import DBThingy from '@models/Thingy';
import { simpleQuery } from '@serviceproviders/QuestdbServiceProvider';
import config from '@utils/appConfig';

export async function getLatestThingys (): Promise<Thingy[]> {
    const whitelist = await DBThingy.findAll();
    const whitelistArray = whitelist.map((thingy) => `'${thingy.mac}'`).join(', ');
    if (whitelistArray === '') return [];

    const QUERY = `SELECT mac, humidity, fwVersion, rssi, temperature, co2_ppm, battery, rollover, latitude, longitude, CAST(extract(epoch from timestamp) as DOUBLE) timestamp FROM ${config.questdb.thingyTableName} WHERE mac IN (${whitelistArray}) LATEST ON timestamp PARTITION BY mac;`;
    return await simpleQuery(QUERY) as Thingy[];
}

export async function sampleBy (sampleDuration: string): Promise<HistoricThingies> {
    const whitelist = await DBThingy.findAll();
    const whitelistArray = whitelist.map((thingy) => `'${thingy.mac}'`).join(', ');
    if (whitelistArray === '') return {};

    const QUERY = `SELECT mac, humidity, rssi, temperature, co2_ppm, battery, packetCount, latitude, longitude, CAST(extract(epoch from ts) as DOUBLE) timestamp FROM (SELECT mac, avg(humidity) as humidity, avg(rssi) as rssi, avg(temperature) as temperature, avg(co2_ppm) as co2_ppm, avg(battery) as battery, CAST(count() as INT) packetCount, avg(latitude) as latitude, avg(longitude) as longitude, timestamp as ts FROM ${config.questdb.thingyTableName} WHERE mac IN (${whitelistArray}) SAMPLE BY ${sampleDuration} ALIGN TO CALENDAR GROUP BY mac, ts);`;
    const data = await simpleQuery(QUERY) as historicThingyRecord[];

    const historicThingies: HistoricThingies = {};

    whitelist.forEach((thingy) => {
        historicThingies[thingy.mac] = {
            thingy,
            locations: {},
            metadata: {}
        };
    });

    for (let i = 0; i < data.length; i++) {
        const thingy = data[i];

        historicThingies[thingy.mac].locations[thingy.timestamp] = [thingy.longitude, thingy.latitude];
        historicThingies[thingy.mac].metadata[thingy.timestamp] = {
            packetCount: thingy.packetCount,
            humidity: thingy.humidity,
            rssi: thingy.rssi,
            temperature: thingy.temperature,
            co2_ppm: thingy.co2_ppm,
            battery: thingy.battery
        };
    };

    return historicThingies;
}

export async function getPacketCount (mac: string): Promise<number> {
    const QUERY = `SELECT CAST(count() as INT) as packetCount FROM ${config.questdb.thingyTableName} WHERE mac = '${mac}'`;
    const data = await simpleQuery(QUERY) as Array<{ packetCount: number }>;
    return data[0].packetCount;
}

export async function getLatestBatteryLocation (mac: string): Promise<latestBatteryLocation> {
    const QUERY = `SELECT battery, latitude, longitude, CAST(extract(epoch from timestamp) as DOUBLE) timestamp FROM ${config.questdb.thingyTableName} WHERE mac = '${mac}' LATEST ON timestamp PARTITION BY mac;`;
    const data = await simpleQuery(QUERY) as latestBatteryLocation[];
    return data[0];
}

function makeGraphQuery (mac: string, field: string): string {
    return `SELECT ${field} as y, CAST(extract(epoch from timestamp) as DOUBLE) x FROM ${config.questdb.thingyTableName} WHERE mac = '${mac}';`;
}

export async function getBatteryGraph (mac: string): Promise<graphData[]> {
    const QUERY = makeGraphQuery(mac, 'battery');
    const data = await simpleQuery(QUERY) as graphData[];
    return data;
}

export async function getTemperatureGraph (mac: string): Promise<graphData[]> {
    const QUERY = makeGraphQuery(mac, 'temperature');
    const data = await simpleQuery(QUERY) as graphData[];
    return data;
}

export async function getHumidityGraph (mac: string): Promise<graphData[]> {
    const QUERY = makeGraphQuery(mac, 'humidity');
    const data = await simpleQuery(QUERY) as graphData[];
    return data;
}

export async function getCo2PPMGraph (mac: string): Promise<graphData[]> {
    const QUERY = makeGraphQuery(mac, 'co2_ppm');
    const data = await simpleQuery(QUERY) as graphData[];
    return data;
}
