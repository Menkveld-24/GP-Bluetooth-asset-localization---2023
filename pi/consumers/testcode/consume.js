const { Kafka } = require('kafkajs')

const kafka = new Kafka({
    clientId: 'my-app',
    brokers: [
        '192.168.1.201:29093',
    ],
});


const consumer = kafka.consumer({ groupId: 'test-group' });

(async () => {
    let connected = await consumer.connect()
    console.log(connected);
    let subscribed = await consumer.subscribe({ topic: 'WHITELISTED_THINGYS', fromBeginning: true })
    console.log(subscribed);

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log({
                value: message.value.toString(),
            })
        },
    });

    console.log("heo");

})().catch(e => {
    console.log(e);
});
// CREATE STREAM merged_entries AS
// SELECT *
// FROM TEST_TOPIC s
// LEFT JOIN LOCATION_TEST_TOPIC l
//     ON s.id = l.id
// EMIT CHANGES;