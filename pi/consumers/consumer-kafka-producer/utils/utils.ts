import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import config from 'config';
import { Redis } from 'ioredis';
import { Consumer, Kafka, Producer, RecordMetadata } from 'kafkajs';
import axios from 'axios';

/**
 * Logger to auto-format logs
 * @date 17-5-2023 - 23:07:37
 *
 * @export
 * @param {any} message - Message to log
 */
export function log(message: any): void
{
    console.log(`[${new Date().toLocaleString()}] ${message}`);
    return;
}


export async function getWhitelist(): Promise<Array<string>>
{
    const response = await axios.get(`${config.get('webserver.url')}/api/general/whitelist`);
    return response.data;
}


export function isWhitelisted(mac: string, whitelist: Array<string>): boolean
{
    return whitelist.indexOf(mac) !== -1;
}

export interface BLEPacket {
    mac: string;
    timestamp: number;
    rssi: number;
    fwVersion: number;
    rollover: number;
    co2_ppm: number;
    humidity: number;
    temperature: number;
    battery: number;
    location?: {
        latitude: number;
        longitude: number;
    }
}

export function getRandomInt(min: number, max: number): number
{
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
  }
  