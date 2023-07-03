process.env["NODE_APP_INSTANCE"] = "manager";
process.env["KAFKAJS_NO_PARTITIONER_WARNING"] = "true";

import { writeFileSync } from 'fs';
import { KafkaHelper } from './utils/KafkaHelper';
import { RedisHelper, RedisMetrics } from './utils/RedisHelper';
import { ConsumerConfig, getConsumerConfig } from './utils/config';
import { log } from './utils/utils';


let allmetrics = 'time, length, total_packets, consumer_lag, location_consumer_lag, consumers_pending \n';
const config: ConsumerConfig = getConsumerConfig();
const redisHelper = new RedisHelper(config);
const kafkaHelper = new KafkaHelper(config);
let hasChanged: boolean = false;
let lastMetricsCount = 0;

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

        if (metrics.total_packets > lastMetricsCount && !hasChanged) {
            hasChanged = true;
        } 

        const pending = await redisHelper.redis.redis.xpending('ble_packets', 'kafka_data_pusher');
        console.log(`Pending: ${pending[0]}`);
        allmetrics += `${Date.now()}, ${metrics.length}, ${metrics.total_packets}, ${metrics.consumer_lag}, ${metrics.location_consumer_lag}, ${pending[0]} \n`;
        if (metrics.total_packets === lastMetricsCount && hasChanged && metrics.consumer_lag === 0 && metrics.location_consumer_lag === 0 && metrics.total_packets !== 0 && pending[0] === 0) {
            hasChanged = false;
            writeFileSync(`metrics_${lastMetricsCount}.csv`, allmetrics);
            allmetrics = 'time, length, total_packets, consumer_lag, location_consumer_lag, consumers_pending \n';
        }
        lastMetricsCount = metrics.total_packets;

    }, getConsumerConfig().redis.read_interval_ms);

})().catch(e => {
    console.log(e);
});