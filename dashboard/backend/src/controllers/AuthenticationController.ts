import express from 'express';
import passport from '@serviceproviders/AuthenticationServiceProvider';
import { loginValidator } from '@validators/LoginValidator';

const router = express.Router();

router.post(
    '/login',
    loginValidator,
    passport.authenticate('local'),
    function (req, res) {
        res.success('Login successful');
    }
);

router.get('/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err !== undefined) {
            next(err);
            return;
        }
        res.redirect('/');
    });
});
export default router;
