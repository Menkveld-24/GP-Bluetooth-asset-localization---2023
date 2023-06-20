import UnauthenticatedException from '@exceptions/UnauthenticatedException';
import { type Request, type Response } from 'express';

export default function protectWithSession (req: Request, res: Response, next: any): void {
    if (!req.isAuthenticated()) {
        return next(new UnauthenticatedException('Not authenticated'));
    }

    next();
};
