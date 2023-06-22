import config from '../utils/configLoader';
import KsqldbClient from 'ksqldb-client';
import { log } from '../utils/logger';

const ksql = new KsqldbClient({
    host: config.ksql.host,
    port: config.ksql.port
});

export async function connectToKsql (): Promise<void> {
    log(`Connecting to KSQL... (${config.ksql.host}:${config.ksql.port})`);
    await ksql.connect();
    log('Connected to KSQL!');
}

export default ksql;
