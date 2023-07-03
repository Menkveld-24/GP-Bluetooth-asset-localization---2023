process.env["NODE_APP_INSTANCE"] = "manager";
process.env["KAFKAJS_NO_PARTITIONER_WARNING"] = "true";

import { KafkaHelper } from './utils/KafkaHelper';
import { RedisHelper, RedisMetrics } from './utils/RedisHelper';
import { ConsumerConfig, getConsumerConfig } from './utils/config';

const config: ConsumerConfig = getConsumerConfig();
const redisHelper = new RedisHelper(config);
const kafkaHelper = new KafkaHelper(config);

(async () => {
    await redisHelper.init();
    await kafkaHelper.init();
    
    // Validate stream existence
    const streamExists: boolean = await redisHelper.checkIfStreamExists(false);
    if(!streamExists) await redisHelper.createStream(config.redis.packet_stream);
    
    // Validate group existence
    for(const group of config.redis.manager.consumer_groups){
        const groupExists = await redisHelper.checkIfGroupExists(group, false);
        if(!groupExists) {
            await redisHelper.createGroup(config.redis.packet_stream, group);
            await redisHelper.checkIfGroupExists(group);
        }
    }

    // Periodically flush acknowledged packets
    setInterval(async () => {
        await redisHelper.flushProcessedPackets(); 
        const metrics: RedisMetrics | null = await redisHelper.getMetrics();
        if(metrics === null) return;


    }, getConsumerConfig().redis.read_interval_ms);

})().catch(e => {
    console.log(e);
});