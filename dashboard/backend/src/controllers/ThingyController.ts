import Thingy from '@models/Thingy';
import express, { type Request, type Response } from 'express';
import multer from 'multer';
import { createNewThingyValidator, imageValidator } from '@validators/ThingyValidators';
import { addToWhitelist, removeFromWhitelist } from '@services/KafkaWhitelistService';
import thingyExists from '@middlewares/ThingyExistsMiddleware';
import { getBatteryGraph, getCo2PPMGraph, getHumidityGraph, getLatestBatteryLocation, getPacketCount, getTemperatureGraph } from '@services/QuestdbService';
import { type InspectedThingy } from '@app/interfaces/ThingyInspectInterface';
import path from 'path';
import { getOrSetJson } from '@services/CachingService';

const upload = multer({
    dest: path.join(__dirname, '../public/uploads'),
    fileFilter: imageValidator
});

const router = express.Router();

// Async is (mostly) supported in v4 of express but the typings don't support it
// eslint-disable-next-line
router.get('/all', async (req: Request, res: Response) => {
    const thingys = await Thingy.findAll();
    res.success(thingys, 'All thingies');
});

router.post(
    '/create',
    [upload.single('image'), createNewThingyValidator],
    // eslint-disable-next-line
    async (req: Request, res: Response) => {
        const newThingy = await Thingy.create({
            name: req.body.name,
            description: req.body.description,
            mac: req.body.mac,
            image: req.file?.filename ?? 'error'
        });

        const isWhitelisted = await addToWhitelist(req.body.mac);
        if (!isWhitelisted) {
            await newThingy.destroy();
            res.fail('Failed to whitelist thingy', ['Failed to whitelist thingy']);
            return;
        }

        res.success(null, 'Thingy created!');
    }
);

// eslint-disable-next-line
router.get('/inspect/:thingyId', thingyExists, async (req: Request, res: Response) => {

    const inspectedThingy = await getOrSetJson(`thingy-info-${req.params.thingyId}`, async () => {
        const info: InspectedThingy = {
            mac: req.body.thingy.mac,
            thingy: req.body.thingy,
            latestRecord: await getLatestBatteryLocation(req.body.thingy.mac),
            packetCount: await getPacketCount(req.body.thingy.mac),
            graphData: {
                battery: await getBatteryGraph(req.body.thingy.mac),
                temperature: await getTemperatureGraph(req.body.thingy.mac),
                humidity: await getHumidityGraph(req.body.thingy.mac),
                co2_ppm: await getCo2PPMGraph(req.body.thingy.mac)
            }
        };
        return info;
    });

    res.success(inspectedThingy, `Thingy ${req.params.thingyId}`);
});

// eslint-disable-next-line
router.post('/delete/:thingyId', thingyExists, async (req: Request, res: Response) => {
    const isWhitelisted = await removeFromWhitelist(req.body.thingy.mac);
    if (!isWhitelisted) {
        res.fail('Failed to whitelist thingy', ['Failed to whitelist thingy']);
        return;
    }

    await req.body.thingy.destroy();
    res.success(null, `Thingy ${req.params.thingyId} deleted!`);
});

export default router;
