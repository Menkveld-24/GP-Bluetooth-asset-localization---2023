import { Strategy } from 'passport-local';
import Bearer from 'passport-http-bearer';
import User from '@models/User';
import passport from 'passport';
import { log } from '@utils/logger';
import config from '@utils/appConfig';
import ApiAuthenticatedException from '@exceptions/ApiUnauthenticatedException';
import { comparePassword } from '@utils/PasswordCrypter';
import UnauthenticatedException from '@exceptions/UnauthenticatedException';

passport.initialize();

passport.use(
    new Strategy((username: string, password: string, next: any) => {
        User.findOne({ where: { name: username } }).then((user) => {
            if (user === null) return next(new UnauthenticatedException('User not found'));

            if (comparePassword(password, user.password)) return next(null, user);

            return next(new UnauthenticatedException('Invalid password credentials'));
        }).catch((err) => {
            log(err);
        });
    })
);

passport.use(new Bearer.Strategy(
    function (token: string, done) {
        if (token === config.http.apiKey) {
            done(null, true);
            return;
        }
        done(new ApiAuthenticatedException('Not authenticated'));
    }
));

passport.serializeUser(function (_user, done) {
    const user = _user as {
        id: number
        name: string
    };

    if (user === null) {
        done(true, null);
        return;
    }

    const userInfo = {
        id: user.id,
        name: user.name
    };
    done(null, userInfo);
});

passport.deserializeUser(function (userInfo: any, done) {
    if (userInfo === null || userInfo?.id === null) {
        done(true, null);
        return;
    }

    User.findByPk(userInfo.id).then((user) => {
        if (user == null) {
            done(true, null);
            return;
        }

        done(null, user);
    }).catch((err) => {
        log(err);
    });
});

export default passport;
