import config from '@utils/appConfig';
import { log } from '@utils/logger';
import { Sequelize } from 'sequelize';

const sequelize: Sequelize = new Sequelize(
    'qdb',
    'admin',
    'quest',
    {
        dialect: 'postgres',
        host: config.questdb.host,
        port: config.questdb.port,
        logging: false
        // timezone: '+02:00',
        // dialectOptions: {
        //     useUTC: true // for reading from database
        // }
    }
);

export async function connectToQuestDB (): Promise<void> {
    log('Testing the connection to the QuestDB...');
    await sequelize.authenticate();
    log('Successfully connected to the QuestDB!');
};

export async function simpleQuery (query: string): Promise<unknown[]> {
    const [data, meta] = await sequelize.query(query);
    // console.log(data, meta);
    return data;
}
