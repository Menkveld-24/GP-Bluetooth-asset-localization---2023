import { log } from 'console';
import { type Request, type Response } from 'express';
import { CustomError } from '@exceptions/GenericException';

export function customErrorResponseHandler (err: any, req: Request, res: Response, next: any): void {
    if (err instanceof CustomError) {
        res.status(200).json(err.toJSON());
        return;
    }

    // Handle other errors
    log('HTTP error!', err);
    res.status(500).json({ error: 'Internal Server Error' });
}
