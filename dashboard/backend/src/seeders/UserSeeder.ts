import User from '@models/User';
import { connectToDb } from '@serviceproviders/DatabaseServiceProvider';
import { hashPassword } from '@utils/PasswordCrypter';
import { log } from '@utils/logger';

export async function seed (): Promise<void> {
    log('Seeding users...');
    await connectToDb();
    await User.truncate();
    log('Successfully truncated users!');

    await User.create({
        name: 'admin',
        password: hashPassword('admin!')
    });
    log('Successfully seeded users!');
}
