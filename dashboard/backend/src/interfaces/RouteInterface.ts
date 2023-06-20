import { type Request, type Response, type Router } from 'express';

interface Route {
    prefix: string
    router: Router
    middlewares: Array<(req: Request, res: Response, next: any) => void>
}

export default Route;
