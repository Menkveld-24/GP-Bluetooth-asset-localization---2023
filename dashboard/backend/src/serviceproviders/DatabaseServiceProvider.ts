import { Sequelize } from 'sequelize';
import config from '@utils/appConfig';
import { initThingy } from '@models/Thingy';
import { initUser } from '@models/User';
import { log } from '@utils/logger';
// import { hashPassword } from './auth/bcrypt';

const sequelize: Sequelize = new Sequelize(
    config.db.database,
    config.db.user,
    config.db.password,
    {
        dialect: 'mysql',
        host: config.db.host,
        port: config.db.port,
        logging: false
    }
);

initThingy(sequelize);
initUser(sequelize);

export async function connectToDb (): Promise<void> {
    log('Testing the connection to the database...');
    await sequelize.authenticate();
    log('Successfully connected to the database!');
    log('Synchronizing tables...');
    await sequelize.sync({ force: false, logging: false });
    log('Successfully synchronized tables!');
};
