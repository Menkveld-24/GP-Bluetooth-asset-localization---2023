import { getOrSetJson } from '@services/CachingService';
import { getLatestThingys } from '@services/QuestdbService';
import express, { type Request, type Response } from 'express';

const router = express.Router();

// eslint-disable-next-line
router.get('/last-locations', async (req: Request, res: Response) => {
    const thingys = getOrSetJson('last-locations', async () => {
        return await getLatestThingys();
    });
    res.success(thingys, `Last locations: ${Date.now()}`);
});

export default router;
