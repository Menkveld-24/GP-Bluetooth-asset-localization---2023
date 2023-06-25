import Thingy from '@models/Thingy';
import { connectToDb } from '@serviceproviders/DatabaseServiceProvider';
import { generateImage } from 'js-image-generator';
import { log } from '@utils/logger';
import path from 'path';
import { writeFileSync } from 'fs';
import config from '@utils/appConfig';
import { connectToKafka } from '@serviceproviders/KafkaServiceProvider';
import { getWhitelist } from '@services/KsqlService';
import { addToWhitelist, removeFromWhitelist } from '@services/KafkaWhitelistService';

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

export async function seed (): Promise<void> {
    log('Seeding thingies...');
    await connectToDb();
    await connectToKafka();
    const whitelist = await getWhitelist();
    await Thingy.truncate();
    log('Successfully truncated thingies!');

    log('Clearing whitelist...');
    for (const entry of whitelist) {
        if (entry.WHITELISTED) {
            await removeFromWhitelist(entry.MAC);
        }
    }

    for (const mac of thingyMacs) {
        const randomUUID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        generateImage(800, 500, 80, function (err, image) {
            if (err !== null) {
                log('Error generating image', err);
                throw err;
            }
            if (config.isProduction) {
                writeFileSync(path.join(__dirname, `../../dist/public/uploads/${randomUUID}`), image.data);
            } else {
                writeFileSync(path.join(__dirname, `../public/uploads/${randomUUID}`), image.data);
            }
        });

        await Thingy.create({
            mac,
            name: 'Thingy ' + mac,
            description: 'A thingy',
            image: randomUUID
        });

        await addToWhitelist(mac);
    }

    log('Successfully seeded thingies!');
}
