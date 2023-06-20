import Thingy from '@models/Thingy';
import { type Request, type Response } from 'express';

export default async function thingyExists (req: Request, res: Response, next: any): Promise<void> {
    const thingy = await Thingy.findOne({
        where: {
            id: req.params.thingyId
        }
    });

    if (thingy === null) {
        res.fail('Thingy not found', [`Thingy ${req.params.thingyId} not found!`]);
        return;
    }

    req.body.thingy = thingy;

    next();
};
