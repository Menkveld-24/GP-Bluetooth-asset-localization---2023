import config from 'config';
import { Redis } from 'ioredis';
import { BLEPacket, isWhitelisted, log } from './utils';
import { ConsumerConfig } from './config';
import { EventEmitter } from 'stream';

interface RedisInterface{
    redis: Redis;
    stream: string;
    group: string;
    consumer: string;       
}

export interface RedisPacketList {
    packets: Array<BLEPacket>;
    packetIDs: Array<string>;
}

export interface RedisMetrics {
    identifier: string;
    length: number;
    total_packets: number;
    consumer_lag: number;
    location_consumer_lag: number;
}

export class RedisHelper extends EventEmitter{

    config: ConsumerConfig;
    redis: RedisInterface;
    #PROCESSED_PREFIX: string = "last_processed:";

    constructor(conf: ConsumerConfig){
        super();
        this.config = conf;

        this.redis = {
            redis: new Redis(this.config.redis.connection),
            stream: this.config.redis.packet_stream,
            group: this.config.redis.consumer.group,
            consumer: `consumer_${this.config.device.identifier}_p_${this.config.device.process_id}`
        }
    }

    /**
     * Initialize the RedisHelper by waiting for a connection to Redis
     * @date 3-7-2023 - 18:30:29
     *
     * @async
     * @returns {Promise<void>}
     */
    async init(): Promise<void>
    {
        await this.#waitForRedisConnection();
        return;
    }

    /**
     * Try to consume new packets from the redis stream based on the whitelist
     * @date 3-7-2023 - 18:30:53
     *
     * @async
     * @param {Array<string>} whitelist - Array of whitelisted mac addresses
     * @param {(packets: RedisPacketList) => any} callback - Callback function that will be called with the packets as a parameter
     * @returns {Promise<void>}
     */
    async consume(whitelist: Array<string>, callback: (packets: RedisPacketList) => any): Promise<void>
    {
        const rawPackets = await this.redis.redis.xreadgroup(
                                'GROUP',
                                this.config.redis.consumer.group,
                                this.redis.consumer,
                                'COUNT',
                                this.config.redis.claim_size,
                                'STREAMS',
                                this.redis.stream,
                                '>'
                            );
        
        if(rawPackets === null) {
            log("No data");
            return;
        }    

        // @ts-ignore
        callback(this.#parseRedisResponse((rawPackets[0][1] as Array<any>), whitelist));
        return;
    }

    /**
     * Acknowledge an array of packet IDs
     * @date 3-7-2023 - 18:30:03
     *
     * @async
     * @param {Array<string>} packetIDs - Array of packet IDs to acknowledge
     * @returns {Promise<void>}
     */
    async acknowledgePackets(packetIDs: Array<string>): Promise<void>
    {
        const ack = await this.redis.redis.xack(this.redis.stream, this.redis.group, ...packetIDs);
        log(`Acked ${ack}/${packetIDs.length} items!`);
        await this.#setLastProcessed(packetIDs);
        return;
    }

    /**
     * Waits for a connection with redis for 5 times 
     * with a second delay between attempts.
     * @date 17-5-2023 - 23:06:22
     *
     * @async
     * @returns {Promise<boolean>}
     */
    async #waitForRedisConnection(): Promise<boolean>
    {    
        log('Checking for redis connection....');
        const connectionAttempts: number = 5;
        const connectionDelay: number = 1000;
        let status: string = this.redis.redis.status;

        // Attempt a few times to connect to redis
        for(let i: number = 0; i < connectionAttempts; i++) {
            status = this.redis.redis.status;
            log(`Redis connection status: ${status}`);
            if(status === 'ready') {
                break;
            }
            await new Promise(resolve => setTimeout(resolve, connectionDelay));
        }

        if(status !== 'ready'){
            throw new Error('Redis connection failed!');
        }

        const ping = await this.redis.redis.ping();
        log(`Redis ping: ${ping}`);

        return status === 'ready';
    }

    /**
     * Checks if a stream exists
     * @date 17-5-2023 - 23:08:02
     *
     * @async
     * @returns {Promise<boolean>}
     */
    async checkIfStreamExists(failOnNotFound: boolean = true): Promise<boolean>
    {
        const streamExists = await this.redis.redis.exists(this.redis.stream);

        if(!streamExists && failOnNotFound) {
            throw new Error(`Stream ${this.redis.stream} does not exist!`);
        } else if(!streamExists) {
            log(`Stream ${this.redis.stream} does not exist!`);
            return false;
        }

        log(`Stream ${this.redis.stream} exists!`);
        return streamExists === 1;
    }

    /**
     * Updates the last_processed:{GROUP} key in redis to
     * the latest processed ID
     * @date 17-5-2023 - 23:10:14
     *
     * @async
     * @param {Array<any>} rawResults - The raw results from redis.xreadgroup
     * @returns {Promise<void>}
     */
    async #setLastProcessed(rawEntryIDs: Array<string>): Promise<void>
    {
        if(rawEntryIDs.length === 0) return;

        // Parsing all values to ints and filtering nulls
        let entries: Array< null | number> = rawEntryIDs.map((entry: any) => {
            return parseInt(entry) || null;
        });

        const entryIDs: Array<number> = (entries.filter((entryID: number | null) => { 
            return entryID !== null 
        }) as Array<number>);
        
        // Get the latest processed entry
        const latestProcessedEntry: number = Math.max(...entryIDs);

        await this.redis.redis.set(`${this.#PROCESSED_PREFIX}${this.redis.group}`, latestProcessedEntry);
        log(`Set ${this.#PROCESSED_PREFIX}${this.redis.group} to: ${latestProcessedEntry}`);
        return;
    }

    /**
     * Check if a group exists for a stream
     * @date 18-5-2023 - 22:26:21
     *
     * @async
     * @param {string} group - Group name
     * @returns {Promise<boolean>}
     */
    async checkIfGroupExists(group: string, failOnNotFound: boolean = false): Promise<boolean>
    {
        const groupExists: Array<any> = (await this.redis.redis.xinfo('GROUPS', this.redis.stream) as Array<any>);
        let exists: boolean = false;

        groupExists.forEach((existingGroup: any) => {
            if(existingGroup[1] === group) {
                log(`Group ${group} exists!`);
                exists = true;
            }
        });

        if(exists) return true;

        if(failOnNotFound) throw new Error(`Group ${group} does not exist!`);

        log(`Group ${group} does not exist!`);
        return false;
    }

    /**
     * Attempt to claim unacknowledged messages for a stream
     * 
     * @returns {Array<any>} - Empty array or the claimed messages
     */
    async periodicAutoClaim(whitelist: Array<string>, callback: (packets: RedisPacketList) => any): Promise<void>{
        const claimedMessages: Array<any> = await this.redis.redis.xautoclaim(
                                                this.redis.stream, 
                                                this.redis.group, 
                                                this.redis.consumer, 
                                                this.config.redis.autoclaim.min_idle_time_ms, 
                                                0
                                            );
        log(`Claimed ${claimedMessages[1].length} messages for ${this.redis.consumer} in ${this.redis.stream}`);
        
        callback(this.#parseRedisResponse(claimedMessages[1], whitelist));
        return;
    }

    /**
     * Parse a raw redis read into a list of packets
     * @date 3-7-2023 - 19:24:10
     *
     * @param {Array<any>} rawPackets
     * @param {Array<string>} whitelist - Whitelisted MAC addresses
     * @returns {RedisPacketList}
     */
    #parseRedisResponse(rawPackets: Array<any>, whitelist: Array<string>): RedisPacketList
    {
        let packetIDs: Array<string> = [];
        let packets: Array<BLEPacket> = [];

        for(const [entryId, data] of rawPackets) {
            const packet: BLEPacket = JSON.parse(data[1]);
            packetIDs.push(entryId);

            if(isWhitelisted(packet.mac, whitelist)) {
                packets.push(packet);
            }
        }
        log(`Found and parsed ${packets.length} packets!`);
        log(`${packetIDs.length} Packet IDs: ${packetIDs}`)

        return {
            packets: packets, 
            packetIDs: packetIDs
        };
    }

    /**
     * Create the packets stream
     * @date 3-7-2023 - 18:28:19
     *
     * @async
     * @param {string} stream - Stream name
     * @returns {Promise<void>}
     */
    async createStream(stream: string): Promise<void>
    {
        const addedID = await this.redis.redis.xadd(stream, '*', 'data', 'stream created');

        if(addedID === null) {
            throw new Error(`Failed to add stream ${stream}`);
        }
        
        // delete just-added entry
        await this.redis.redis.xdel(stream, addedID);
        // validate stream existence
        await this.checkIfStreamExists();
        log(`Added stream ${stream}!`);

        return;
    }

    /**
     * Create a consumer group for a stream
     * @date 3-7-2023 - 18:27:49
     *
     * @async
     * @param {string} stream - Stream name
     * @param {string} group - Group name
     * @returns {Promise<void>}
     */
    async createGroup(stream: string, group: string): Promise<void>
    {
        const created = await this.redis.redis.xgroup('CREATE', stream, group, '$');
        log(`Created group ${group}: ${created}`);
        return
    }

    /**
     * Retrieve some metrics regarding the (location)consumers from the Redis Stream
     * @date 3-7-2023 - 18:27:03
     *
     * @async
     * @returns {Promise<RedisMetrics | null>}
     */
    async getMetrics(): Promise<RedisMetrics | null>
    {
        const rawMetrics = (await this.redis.redis.xinfo('STREAM', this.redis.stream, 'FULL', 'COUNT', 1) as Array<any>);
        if(rawMetrics.length !== 18) return null;

        let consumerLag, locationConsumerLag: number = 0;
        for(const group of rawMetrics[17]) {
            if(group[1] === this.config.redis.manager.consumer_groups[0]){
                consumerLag = group[7];
            } else if(group[1] ===  this.config.redis.manager.consumer_groups[1]) {
                locationConsumerLag = group[7];
            }
        }

        const metrics: RedisMetrics = {
            identifier: `${this.config.device.identifier}_p_${this.config.device.process_id}`,
            length: rawMetrics[1],
            total_packets: rawMetrics[11],
            consumer_lag: consumerLag,
            location_consumer_lag: locationConsumerLag,
        };

        console.log(metrics);
        return metrics;
    }
    
    /**
     * Look up the latest acknowledged entries from the Redis Stream and delete them
     * @date 3-7-2023 - 18:24:43
     *
     * @async
     * @returns {Promise<void>}
     */
    async flushProcessedPackets(): Promise<void>
    {
        const consumerGroups: Array<string> = this.config.redis.manager.consumer_groups;
        let allConsumerGroupKeys: Array<string> = consumerGroups.map((group: string) => {
            return `${this.#PROCESSED_PREFIX}${group}`;
        });

        // Parsing all values to ints and filtering nulls
        let rawLastProcessedEntries: Array<string | null | number> = await this.redis.redis.mget(...allConsumerGroupKeys);

        rawLastProcessedEntries  = (rawLastProcessedEntries.map((entryID: string | null | number) => {
            return parseInt((entryID as string)) || null;
        }) as Array<number | null>);
        // @ts-ignore
        const lastProcessedEntries: Array<number> = rawLastProcessedEntries.filter((entryID: number | null) => { 
            return entryID !== null 
        });

        if(lastProcessedEntries.length === 0) return;

        // A newer entry is always higher than an older one, so the lowest entryID is the oldest and
        // the upper boundary of what we might be able to delete
        let oldestProcessedEntry: number = Math.min(...lastProcessedEntries);

        // Checking if there are no older entries which are still pending
        for(const consumerGroup of consumerGroups) {
            // Get all pending entries for this consumer 
            const rawPendingEntries: Array<any> = await this.redis.redis.xpending(
                                                                        this.redis.stream, 
                                                                        consumerGroup,
                                                                        '-',
                                                                        oldestProcessedEntry,
                                                                        '99999999999999999'
                                                                    );
            // If there are pending entries, check if the oldest one is older than the oldest processed entry
            if(rawPendingEntries.length > 0) {
                // Parsing all values to ints and filtering nulls
                let pendingEntries: Array< null | number> = rawPendingEntries.map((entry: any) => {
                    return parseInt(entry[0]) || null;
                });

                const pendingEntryIDs: Array<number> = (pendingEntries.filter((entryID: number | null) => { 
                    return entryID !== null 
                }) as Array<number>);
                
                // See if we have an even older pending key
                oldestProcessedEntry = Math.min(oldestProcessedEntry, ...pendingEntryIDs);
            }
        }

        // Delete all entries older than the oldest processed entry
        const deletedEntries: number = await this.redis.redis.xtrim(this.redis.stream, 'MINID', oldestProcessedEntry);
        log(`Trimmed ${deletedEntries} entries until ${oldestProcessedEntry}!`);

        return;
    }
}
