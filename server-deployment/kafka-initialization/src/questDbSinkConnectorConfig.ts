import config from './utils/configLoader';

export default {
    name: 'QuestDBSinkConnector_MergedThingyLocationBeacons',
    config: {
        'value.converter.schema.registry.url': config.kafka.schemaRegistry,
        'key.converter.schema.registry.url': config.kafka.schemaRegistry,
        'schema.registry.url': config.kafka.schemaRegistry,
        name: 'QuestDBSinkConnector_MergedThingyLocationBeacons',
        'connector.class': 'io.questdb.kafka.QuestDBSinkConnector',
        'value.converter': 'io.confluent.connect.avro.AvroConverter',
        'value.converter.schema.enable': 'true',
        topics: config.ksql.merged_location_beacons.name,
        host: `${config.questdb.host}:${config.questdb.port}`,
        'timestamp.field.name': 'BEACON_TIMESTAMP',
        doubles: 'FWVERSION,RSSI,CO2_PPM,ROLLOVER',
        'include.key': 'false',
        'key.converter': 'org.apache.kafka.connect.converters.ByteArrayConverter'
    }
};
