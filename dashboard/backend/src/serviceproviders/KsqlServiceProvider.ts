import { log } from '@utils/logger';
import config from '@utils/appConfig';
import KsqldbClient from 'ksqldb-client';

const client = new KsqldbClient({
    host: config.ksql.host,
    port: config.ksql.port
});

export async function waitForKsqlConnection (): Promise<void> {
    log('Testing the connection to KSQL...');
    await client.connect();
    log('Successfully connected to KSQL!');

    log('Checking for the whitelist table...');
    const tables = await client.listTables();
    let foundWhitelistTable: boolean = false;
    for (const table of tables) {
        foundWhitelistTable = foundWhitelistTable || table.name === config.ksql.whitelistTable;
    }

    if (!foundWhitelistTable) throw new Error('Whitelist table not found!');
    log('Successfully connected to KSQL!');
}

export default client;
