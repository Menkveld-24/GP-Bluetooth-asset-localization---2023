import sampleExists from '@middlewares/HistoricalSamplingMIddleware';
import { getOrSetJson } from '@services/CachingService';
import { sampleBy } from '@services/QuestdbService';
import express, { type Request, type Response } from 'express';

const router = express.Router();

// eslint-disable-next-line
router.get('/sample/:duration', sampleExists, async (req: Request, res: Response) => {
    const sample = await getOrSetJson(`historic-sample-${req.params.duration}`, async () => {
        return await sampleBy(req.params.duration);
    });

    res.success(sample, `Sampled data: ${Date.now()}`);
});

export default router;
