import config from 'utils/configLoader';

const QUERY = `CREATE STREAM ${config.ksql.merged_location_beacons.name} WITH (PARTITIONS=${config.ksql.merged_location_beacons.partitions}, VALUE_FORMAT='AVRO') AS SELECT
B.MAC mac,
L.MAC mac2,
B.HUMIDITY humidity,
B.FWVERSION fwversion,
B.RSSI rssi,
B.TEMPERATURE temperature,
B.CO2_PPM co2_ppm,
B.BATTERY battery,
B.ROLLOVER rollover,
L.LATITUDE latitude,
L.LONGITUDE longitude,
COALESCE(B.ROWTIME, L.ROWTIME) beacon_timestamp
FROM THINGY_BEACONS B
INNER JOIN THINGY_LOCATIONS L WITHIN ${config.ksql.merged_location_beacons.within} MINUTES GRACE PERIOD ${config.ksql.merged_location_beacons.grace_period} MINUTES ON ((B.INDEX = L.INDEX))
PARTITION BY L.MAC
EMIT CHANGES;`;

export default QUERY;
