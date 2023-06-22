import config from '../utils/configLoader';
import { log } from '../utils/logger';

export async function executeQuestDB (query: string): Promise<void> {
    log(`Executing QuestDB query: ${query}`);
    const response = await fetch(`${config.questdb.host}:${config.questdb.port}/exec`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query
        })
    });
    if (!response.ok) {
        console.log(response);
        log(response.status);
        console.log(response.body);
        throw new Error(`Failed to execute QuestDB query: ${query}`);
    }
    log(`Executed QuestDB query: ${query}`);
}

export async function createMergedLocationBeaconsTable (): Promise<void> {
    log(`Creating QuestDB table: ${config.questdb.table_name}`);
    const query = `CREATE TABLE ${config.questdb.table_name} ( mac SYMBOL INDEX, humidity double, fwVersion int, rssi int, temperature double, co2_ppm int, battery double, rollover int, latitude double, longitude double, timestamp TIMESTAMP ) TIMESTAMP(timestamp) PARTITION BY DAY;`;

    await executeQuestDB(query);
    log(`Created QuestDB table: ${config.questdb.table_name}`);
}
