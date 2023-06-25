import { log } from '@utils/logger';
import { connectToQuestDB, simpleQuery } from '@serviceproviders/QuestdbServiceProvider';
import config from '@utils/appConfig';

const thingyMacs = [
    '04955222F451',
    '6F1AA4521E14',
    '32637491178F',
    '37DE05E8F27F',
    '989E21BCB7F7',
    'D1C19A88A341',
    'CDF71D5248BD',
    '46B889C4F75C',
    '9BAC51BEA82B',
    '81FCE9447BE0',
    '5D321373062F',
    'EBF314AC3A37',
    '1F18C64E5FE9',
    '716B2D5970CC',
    'B8A1FBF15C97',
    '6C3C001940C8',
    '7DD0353D5372',
    '5EEF5B23AFEC',
    '345314F7CEB0',
    'F4EEAC315FCA',
    '29C9ECB1DD3D',
    'CC8C9A2D9631',
    '27B92D2F8705',
    '585510BAD65F',
    '085F9DDBD964',
    '8304C36525F7',
    '25995445405A',
    'F39D9C66EC3C',
    '17752DC781C6',
    '44677CF8691A',
    '1C95470BA205',
    'C7A947B07FE3',
    '77220A9CE491',
    '77B5C3DBAFF9',
    '2914FB1629AA',
    '52C2BC4FBCA1',
    '3C708C07F828',
    '8CEBCB9E5E0D',
    '44C19FE0509B',
    '190D6CBD2996',
    'AFF16FF09000',
    'DB0C09B4BAB4',
    '47B8BD819278',
    '3EFADF1C719B',
    '38ABC6C83BCC',
    '312D94A91C1D',
    'D52B6D04BACB',
    '85B19C8246B8',
    '8B4AC0B37326',
    'CEDB85D275CC'
];

// npm run seed --qdbcount=1000 changes this value
const randomEntries = parseInt(process.env.npm_config_qdbcount ?? '1000');

export async function seed (): Promise<void> {
    log('Seeding questdb...');
    await connectToQuestDB();
    log('Successfully truncated users!');

    const insertQuery = `INSERT INTO ${config.questdb.thingyTableName} SELECT * FROM (
        SELECT
            rnd_str('${thingyMacs.join('\', \'')}'),
            rnd_float() * 100,
            rnd_int(1, 3, 0),
            rnd_int(-60, -40, 0),
            rnd_float() + rnd_int(10, 30, 0),
            rnd_int(200, 700, 0),
            rnd_float() * 100,
            rnd_int(0, 255, 0),
            (rnd_float() + 52239) / 1000,
            (rnd_float() + 685) / 100,
            rnd_timestamp(
                to_timestamp('2020-01-01T00:00:00', 'yyyy-mm-ddTHH:mm:ss'),
                to_timestamp('2023-06-28T23:00:00', 'yyyy-mm-ddTHH:mm:ss'),
                0
            )
        FROM long_sequence(${randomEntries})
    );`;

    await simpleQuery(insertQuery);

    log('Successfully seeded questdb!');
}
