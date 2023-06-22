import config from '../utils/configLoader';

const QUERY = `CREATE SOURCE TABLE ${config.ksql.query_output_names.whitelist} WITH (KAFKA_TOPIC='${config.kafka.topics.whitelist.name}', VALUE_FORMAT='AVRO', KEY_FORMAT='AVRO');`;

export default QUERY;
