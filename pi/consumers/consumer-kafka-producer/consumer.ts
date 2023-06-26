process.env["NODE_APP_INSTANCE"] = "consumer";
process.env["KAFKAJS_NO_PARTITIONER_WARNING"] = "true";

import { RedisHelper, RedisPacketList } from './utils/RedisHelper';
import { KafkaHelper } from './utils/KafkaHelper';
import { ConsumerConfig, getConsumerConfig } from './utils/config';
import c, { get } from 'config';
import { getRandomInt, log } from './utils/utils';

let whitelist: Array<string> = [];
const config: ConsumerConfig = getConsumerConfig();
const redisHelper = new RedisHelper(config);
const kafkaHelper = new KafkaHelper(config);


kafkaHelper.on('newWhitelist', (newWhitelist: Array<string>) => {
    whitelist = newWhitelist;
});
const LOOP_INTERVAL_MS: number = config.redis.read_interval_ms;

(async () => {    
    await redisHelper.init();
    await kafkaHelper.init();
    await redisHelper.checkIfStreamExists();
    await redisHelper.checkIfGroupExists(config.redis.consumer.group);

    // ToDo: change interval to sth else so it is more random
    setInterval(async () => {
        new Promise(resolve => setTimeout(resolve, LOOP_INTERVAL_MS + getRandomInt(50, 1000)));
        await redisHelper.periodicAutoClaim(whitelist, handlePackets);
    }, config.redis.autoclaim.interval_ms);

    while(true) {
        await redisHelper.consume(whitelist, handlePackets);
        if (LOOP_INTERVAL_MS === 0) continue;
        await new Promise(resolve => setTimeout(resolve, LOOP_INTERVAL_MS));
    }

})().catch(e => {
    console.log(e);
});


async function handlePackets(data: RedisPacketList): Promise<void>
{
    // We read packets but they weren't whitelisted, so we just acknowledge them
    if(data.packets.length === 0 && data.packetIDs.length !== 0){
        log("No whitelisted packets")
        await redisHelper.acknowledgePackets(data.packetIDs);
        return;
    }

    // We read packets and they were whitelisted, so we send them to Kafka
    if(await kafkaHelper.producePacketsToKafka(data.packets)){
        await redisHelper.acknowledgePackets(data.packetIDs);
        if(data.packets.length !== data.packetIDs.length){
            log("Not all packets were whitelisted!")
        }
    }
}
