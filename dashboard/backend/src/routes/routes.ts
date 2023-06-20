import loginRoute from '@controllers/AuthenticationController';
import thingyRoute from '@controllers/ThingyController';
import livemapRoute from '@controllers/LiveMapController';
import piApi from '@controllers/ApiController';
import session from '@middlewares/SessionMiddleware';
import bearer from '@middlewares/ApiMiddleware';
import historicalRoute from '@controllers/HistoricalDataController';
import userRoute from '@controllers/UserController';
import type Route from '@app/interfaces/RouteInterface';

const routes: Route[] = [
    { prefix: '/auth', router: loginRoute, middlewares: [] },
    { prefix: '/thingy', router: thingyRoute, middlewares: [session] },
    { prefix: '/user', router: userRoute, middlewares: [session] },
    { prefix: '/historical', router: historicalRoute, middlewares: [session] },
    { prefix: '/general', router: piApi, middlewares: [] },
    { prefix: '/live', router: livemapRoute, middlewares: [session] }
];

export default routes;
