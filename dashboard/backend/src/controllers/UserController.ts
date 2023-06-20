import express, { type Response } from 'express';
import type userInfo from '@app/interfaces/UserInfoInterface';
import type User from '@models/User';

const router = express.Router();

router.get('/', (req, res: Response) => {
    const userInfo: userInfo = {
        name: 'undefined',
        authenticated: false
    };

    if (!req.isAuthenticated() || req.user === undefined) {
        res.fail('User not authenticated', ['User not authenticated'], userInfo);
        return;
    }

    const user: User = req.user as User;
    userInfo.name = user.name;
    userInfo.authenticated = true;

    res.success(userInfo, 'User info');
});

export default router;
