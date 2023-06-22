import config from '../utils/configLoader';

const QUERY = `CREATE SOURCE TABLE whitelisted_thingies WITH (KAFKA_TOPIC='${config.kafka.topics.whitelist.name}', VALUE_FORMAT='AVRO', KEY_FORMAT='AVRO');`;

export default QUERY;
