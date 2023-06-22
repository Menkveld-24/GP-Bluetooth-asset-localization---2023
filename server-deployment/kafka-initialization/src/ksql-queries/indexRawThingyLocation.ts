import config from '../utils/configLoader';

const QUERY = `CREATE STREAM ${config.ksql.query_output_names.raw_locations} AS SELECT *, STRUCT(mac:=mac, rollover:=rollover) AS index FROM ${config.kafka.topics.raw_locations.name};`;

export default QUERY;
