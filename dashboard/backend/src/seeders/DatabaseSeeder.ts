import '@utils/appConfig';
import { log } from '@utils/logger';
import { seed as seedUser } from '@seeders/UserSeeder';

async function start (): Promise<void> {
    log('Starting seeder...');
    await seedUser();

    log('Successfully seeded the database!');

    process.exit(0);
}

start().catch((err) => {
    log('error starting', err);
});
