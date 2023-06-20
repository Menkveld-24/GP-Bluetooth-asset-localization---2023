const { Kafka } = require('kafkajs')
const ksqldb = require("ksqlient");
const client = new ksqldb({ ksqldbURL: "http://192.168.1.201:8088" });

const kafka = new Kafka({
    clientId: 'my-app',
    brokers: [
        '192.168.1.201:29093'
    ],
});

const producer = kafka.producer();

(async () => {
    let connected = await producer.connect();
    console.log(connected);
    // console.log(producer);

    const respones = await client.pull("SELECT * FROM WHITELISTED_THINGYS;");
    console.log(respones);


    let sent = await producer.send({
        topic: 'whitelist_thingy_commands',
        messages: [
            { 
                key: 'AABBCCDDEEFF',
                value: JSON.stringify({
                    mac: "AABBCCDDEEFF",
                    whitelisted: false
                })
            },
          ],
    });

    console.log(sent);

})().catch(e => {
    console.log(e);
});

// CREATE STREAM whitelist_thingy_commands_stream2 WITH (
//     KAFKA_TOPIC='whitelist_thingy_commands',
//     VALUE_FORMAT='AVRO',
//     VALUE_SCHEMA_ID=5 
//   );