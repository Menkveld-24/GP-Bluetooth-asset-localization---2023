import config from 'utils/configLoader';

const QUERY = `CREATE STREAM ${config.ksql.query_output_names.raw_beacons} AS SELECT *, STRUCT(mac:=mac, rollover:=rollover) AS index FROM ${config.kafka.topics.raw_beacons.name};`;

export default QUERY;
