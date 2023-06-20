const { Kafka } = require('kafkajs')

const kafka = new Kafka({
    clientId: 'my-app',
    brokers: [
        'localhost:19093'
    ],
});

const producer = kafka.producer();

(async () => {
    let connected = await producer.connect();
    console.log(connected);
    console.log(producer);

    let sent = await producer.send({
        topic: 'test_topic',
        messages: [
            {
                id: 44, 
                value: JSON.stringify({
                    id: 35,
                    user: "Hello KafkaJS!"
                })
            },
          ],
    });

    console.log(sent);

})().catch(e => {
    console.log(e);
});