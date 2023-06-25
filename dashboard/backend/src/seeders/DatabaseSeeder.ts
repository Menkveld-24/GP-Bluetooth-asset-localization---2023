import '@utils/appConfig';
import { log } from '@utils/logger';
import { seed as seedUser } from '@seeders/UserSeeder';
import { seed as seedThingies } from '@seeders/ThingySeeder';
import { seed as seedQuestDb } from '@seeders/QuestDbSeeder';

async function start (): Promise<void> {
    log('Starting seeder...');
    await seedUser();
    await seedThingies();
    await seedQuestDb();

    log('Successfully seeded the database!');

    process.exit(0);
}

start().catch((err) => {
    log('error starting', err);
});
