import { type Request, type Response } from 'express';

export default async function sampleExists (req: Request, res: Response, next: any): Promise<void> {
    const validSamplingIntervals = [
        '1m',
        '5m',
        '10m',
        '15m',
        '30m'
    ];

    if (!validSamplingIntervals.includes(req.params.duration)) {
        res.fail('Invalid sampling interval', [`Sampling interval ${req.params.duration} is not valid!`,
            `Valid sampling intervals are: ${validSamplingIntervals.join(', ')}`]);
        return;
    }

    next();
};
