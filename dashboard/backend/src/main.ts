import '@utils/appConfig';
import { log } from '@utils/logger';
import { connectToDb } from '@serviceproviders/DatabaseServiceProvider';
import { waitForRedisConnection } from '@serviceproviders/RedisServiceProvider';
import { waitForKsqlConnection } from '@serviceproviders/KsqlServiceProvider';
import { connectToQuestDB } from '@serviceproviders/QuestdbServiceProvider';
import { startHTTPServer } from '@app/HttpServer';
import { connectToKafka } from '@serviceproviders/KafkaServiceProvider';

log('dit is een test!');

async function start (): Promise<void> {
    log('Starting app...');
    await connectToDb();
    await waitForRedisConnection();
    await waitForKsqlConnection();
    await connectToQuestDB();
    await connectToKafka();
    startHTTPServer();
}

start().catch((err) => {
    log('error starting', err);
});
