import { getWhitelist } from '@services/KsqlService';
import express, { type Request, type Response } from 'express';

const router = express.Router();

// eslint-disable-next-line
router.get('/whitelist', async (req: Request, res: Response) => {
    const rawWhitelist = await getWhitelist();

    const whitelist: string[] = [];
    for (const entry of rawWhitelist) {
        if (entry.WHITELISTED) {
            whitelist.push(entry.MAC);
        }
    }

    res.send(whitelist);
});

export default router;
