import express from 'express';
import config from '@utils/appConfig';
import routes from '@routes/routes';
import { log } from '@utils/logger';
import passport from '@app/serviceproviders/AuthenticationServiceProvider';
import session from 'express-session';
import RedisStore from 'connect-redis';
import redis from '@serviceproviders/RedisServiceProvider';
// import { customErrorResponseHandler } from '@routes/errorHandler';
import defaultResponseInjector from './middlewares/DefaultResponseMiddleware';
import { customErrorResponseHandler } from '@routes/errorHandler';

export function startHTTPServer (): void {
    log('Starting HTTP server...');

    const app = express();

    app.use(
        session({
            name: config.http.session.name,
            secret: config.http.session.secret,
            resave: false,
            saveUninitialized: true,
            cookie: {
                secure: false,
                sameSite: 'strict',
                httpOnly: true,
                maxAge: Math.floor(config.http.session.duration * 1000)
            },
            store: new RedisStore({
                client: redis,
                prefix: 'user_session:'
            })
        })
    );

    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(defaultResponseInjector);
    app.use('/api/images', express.static('uploads'));

    routes.forEach((route) => {
        route.middlewares.forEach((middleware) => {
            app.use(`/api${route.prefix}`, middleware);
        });
        app.use(`/api${route.prefix}`, route.router);
        log(`Registered route: /api${route.prefix}`);
    });
    app.use(customErrorResponseHandler);

    app.listen(config.http.port, () => {
        log(`App listening at http://localhost:${config.http.port}`);
    });
}
