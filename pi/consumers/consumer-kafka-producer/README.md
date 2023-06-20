# Pi consumers

## Description

This part of the system is responsible for reading the Redis stream with BLE packets and pushing them to the Kafka cluster. It contains 3 applications:
- A manager
- A consumer
- A location consumer

### Manager
The manager is responsible for managing the Redis stream and reporting metrics. It makes sure to setup the proper consumer groups and stream. Along that, it periodically does garbage collection for al acknowledged entries of the stream. This application monitors the performance of the pi by looking at the input and processing lag of the Redis stream.

### Consumer
The consumer reads from the stream with packets and produces them to the Kafka cluster. This application is horizontally scalable; multiple consumers can work in parallel. Before producing to Kafka, it checks if the included MAC addresses are whitelisted, only whitelisted packets will be pushed. Once pushed, it acknowledges that those packets were processed successfully. 

### Location consumer
The location consumer is in many ways similiar to the Consumer. However, it produces data to a different topic in kafka which includes a location. It drops all metadata from a packet and injects a location instead.

## Installation

This project is built with Node.js v18.
Make sure to have the ble-sniffer-producer also up and running as that will be generating the data for Redis.

To install dependencies:
```sh
npm install
```

To start Redis:
```sh
docker compose up -d
```

## Running

Each application can be started via the following commands:

### Manager
```sh
npm run manage
```

### Consumer
```sh
npm run consume
```

### Location Consumer
```sh
npm run location
```

## Inspecting Redis
The contents of redis can be inspected at port `8001`, unless specified differently in the docker-compose.yml.

## Configuration
All 3 applications each use a different config containing the same layout. Some fields are just ignored in case they are not required.

- device.identifier: This is the identifier of the device, this is used to reference the source of the packets or consumer (it must be the same for each 'similar application')
- device.process_id: This is the process id which is added to the device identifier
- webserver.url: The url of the backend webapplication
- redis.consumer.group: The Redis consumer group, should only be 2. One for the consumer and location consumer
- redis.packet_stream: The name of the Redis stream containing the packets (should be the same for all)
- redis.autoclaim.interval_ms: At which rate either consumer starts 'stealing' unacknowledged packets from other consumers for redis.autoclaim.min_idle_time_ms
- redis.read_interval_ms: The delay between each consumption attempt from Redis
- redis.claim_size: The number of packets that will be read per attempt
- kafka.brokers: Some kafka brokers which can be connected to
- kafka.whitelist_topic: The topic name of the whitelist to listen for the commands
- kafka.topic: The topic to which will be produced
- kafka.topic_schema: The schema name and version it needs to use for the key and value to produce and consume
