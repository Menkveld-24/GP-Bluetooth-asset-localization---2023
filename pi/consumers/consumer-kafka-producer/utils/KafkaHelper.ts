import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import { Consumer, Kafka, Message, Producer, RecordMetadata } from 'kafkajs';
import { BLEPacket, getWhitelist, log } from './utils';
import { ConsumerConfig, SchemaConfig } from './config';
import { EventEmitter } from 'stream';

interface KafkaProducer{
    producer: Producer;
    topic: string;
    valueSchema: number | null;
    keySchema: number | null;       
}

interface KafkaConsumer{
    consumer: Consumer;
    topic: string;
    valueSchema: number | null;
    keySchema: number | null;       
}

interface WhitelistEntry {
    mac: string;
    whitelisted: boolean;
}

export class KafkaHelper extends EventEmitter {

    config: ConsumerConfig;
    producer: KafkaProducer | undefined;
    consumer: KafkaConsumer | undefined;
    #registry: SchemaRegistry;
    #whitelist: Array<string> = [];


    constructor(conf: ConsumerConfig, hasProducer: boolean = true, hasConsumer: boolean = true) {
        super();
        this.config = conf;

        const kafka: Kafka = new Kafka({
            clientId: `${this.config.device.identifier}_p_${this.config.device.process_id}`,
            brokers: this.config.kafka.brokers
        });

        if(hasProducer){
            this.producer = {
                producer: kafka.producer(),
                topic: this.config.kafka.topic,
                valueSchema: null,
                keySchema: null
            }
        }
        if(hasConsumer){
            this.consumer = {
                consumer: kafka.consumer({
                        groupId: `consumer_${this.config.device.identifier}_p_${this.config.device.process_id}`
                    }),
                topic: this.config.kafka.whitelist_topic,
                valueSchema: null,
                keySchema: null
            }
        }
        this.#registry = new SchemaRegistry({
            host: this.config.kafka.schema_registry
        });
    }

    
    /**
     * Initialization of the kafka helper
     * @date 19-5-2023 - 18:57:01
     *
     * @async
     * @returns {Promise<void>}
     */
    async init(): Promise<void>
    {
        await this.#waitForKafkaConnection(this.producer?.producer);
        await this.#waitForKafkaConnection(this.consumer?.consumer);
        await this.#initRegistry();
        this.#whitelist = await getWhitelist();
        this.emit('newWhitelist', this.#whitelist);
        await this.#waitForWhitelistConsumer();
    }   

     /**
     * Connect to the registry and load the schemas
     * @date 19-5-2023 - 18:52:08
     *
     * @async
     * @returns {Promise<void>}
     */
     async #initRegistry(): Promise<void>
     {
         if(this.producer !== undefined) {
             [this.producer.keySchema, this.producer.valueSchema] = await this.#loadSchemas(this.config.kafka.topic_schema);
         }
 
         if(this.consumer !== undefined) {
             [this.consumer.keySchema, this.consumer.valueSchema] = await this.#loadSchemas(this.config.kafka.whitelist_topic_schema);
         }
         return;
     }
 
     
     /**
      * Load the schemas from the registry
      * @date 19-5-2023 - 18:52:28
      *
      * @async
      * @param {SchemaConfig} config - Schema config from the config file
      * @returns {Promise<Array<number>>} - [keySchemaId, valueSchemaId]
      */
     async #loadSchemas(config: SchemaConfig): Promise<Array<number>>
     {
         const keySchemaId: number = await this.#registry.getRegistryId(
                 config.key.name,
                 config.key.version
             );
         const valueSchemaId: number = await this.#registry.getRegistryId(
                 config.value.name,
                 config.value.version
             );
 
         return [keySchemaId, valueSchemaId];
     }

    
    /**
     * Produce ble packets to kafka
     * @date 19-5-2023 - 18:53:13
     *
     * @async
     * @param {Array<BLEPacket>} packets - BLE packets to produce to kafka
     * @returns {Promise<void>}
     */
    async producePacketsToKafka(packets: Array<any>): Promise<boolean>
    {
        if(this.producer === undefined) {
            throw new Error("Producer is undefined");
        }

        if(packets.length === 0) return false;

        // Array of messages to produce to kafka
        let messages: Array<Message> = [];

        for(const packet of packets) {
            const timestamp: string = packet.timestamp.toString();

            // @ts-ignore
            delete packet.timestamp;

            let key, value: Buffer | string;
            let rawKey: Object = { 
                mac: packet.mac 
            };

            // Attempt to encode the data 
            if(this.producer.valueSchema !== null) {
                value = await this.#registry.encode(this.producer.valueSchema, packet);
            } else {
                value = JSON.stringify(packet);
            }
            if(this.producer.keySchema !== null) {
                key = await this.#registry.encode(this.producer.keySchema, rawKey);
            } else {
                key = JSON.stringify(rawKey);
            }

            messages.push({
                key: key,
                value: value,
                timestamp: timestamp
            });
        }

        // Produce the messages to kafka
        const result: RecordMetadata[] = await this.producer.producer.send({ 
            topic: this.producer.topic,
            messages: messages
        });

        // Check if the messages were produced successfully
        if(result[0].errorCode !== 0) {
            log(`Failed to produce messages to kafka: ${result[0].errorCode}`);
            return false;
        }

        log(`Produced ${messages.length} messages to partition ${result[0].partition} on topic ${result[0].topicName}`);
        return true;
    }

    
    /**
     * Wait for the whitelist consumer to connect to Kafka, this automatically updates the whitelist
     * @date 19-5-2023 - 18:52:43
     *
     * @async
     * @returns {Promise<void>}
     */
    // ToDo: whitelist packet parsing via registry
    async #waitForWhitelistConsumer(): Promise<void>
    {
        if(this.consumer === undefined) return;

        const subscribed = await this.consumer.consumer.subscribe({ 
            topic: this.consumer.topic
        });
        log(`Subscribed to ${this.consumer.topic}!`);

        await this.consumer.consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                if(message.value === undefined || message.value === null) return;
                
                const changedWhitelistEntry: WhitelistEntry = await this.#registry.decode(message.value);

                if(changedWhitelistEntry.whitelisted){
                    if(!this.#whitelist.includes(changedWhitelistEntry.mac)) {
                        this.#whitelist.push(changedWhitelistEntry.mac);
                    }
                    log(`Whitelist updated, added: ${changedWhitelistEntry.mac}`);
                } else {
                    log(`Whitelist updated, removed: ${changedWhitelistEntry.mac}`);
                    this.#whitelist = this.#whitelist.filter(mac => mac !== changedWhitelistEntry['mac']);
                }
                this.emit('newWhitelist', this.#whitelist);
                return;
            },
        });

        log(`Started whitelist consumer!`);
        return;
    }
    

    /**
     * Wait for a kafka connection to be established
     * @date 18-5-2023 - 23:43:28
     *
     * @export
     * @async
     * @param {Producer | Consumer | undefined} socket - Kafka producer or consumer
     * @returns {Promise<void>}
     */
    async #waitForKafkaConnection(socket: Producer | Consumer | undefined): Promise<void>
    {
        if(socket === undefined) return;
        
        await socket.connect();
        log('Connected to kafka!');
        return;
    }
}
