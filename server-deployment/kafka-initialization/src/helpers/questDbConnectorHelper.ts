import { log } from '../utils/logger';
import config from '../utils/configLoader';
import questDbSinkConnectorConfig from '../questDbSinkConnectorConfig';

export async function uploadSinkConnectorConfig (): Promise<void> {
    const newConfig = questDbSinkConnectorConfig;

    log('Uploading sink connector config to connect', `${config.questdbSinkConnector.host}:${config.questdbSinkConnector.port}}`);
    const currentConnectors = await fetch(`${config.questdbSinkConnector.host}:${config.questdbSinkConnector.port}/connectors`);

    if ((await currentConnectors.json()).indexOf('QuestDBSinkConnector_MergedThingyLocationBeacons') !== -1) {
        log('QuestDBSinkConnector_MergedThingyLocationBeacons already exists');
        return;
    }

    const response = await fetch(`${config.questdbSinkConnector.host}:${config.questdbSinkConnector.port}/connectors`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newConfig)
    });

    console.log(response);

    if (!response.ok) {
        console.log(response);
        log(response.status);
        console.log(response.body);
        throw new Error('Failed to upload sink connector config to connect');
    }

    log('Uploaded sink connector config to connect');
}
