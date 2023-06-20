import { type Request, type Response } from 'express';
import { UnauthenticatedError } from './errorHandler';
import passport from '@modules/auth/passport';

export const apiBearerToken = passport.authenticate('bearer', { session: false });

export function session (req: Request, res: Response, next: any): void {
    if (!req.isAuthenticated()) {
        return next(new UnauthenticatedError('Not authenticated'));
    }

    next();
}
