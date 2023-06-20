import { type Request, type Response } from 'express';
import type defaultResponse from '@app/interfaces/DefaultResponseInterface';

export default function defaultResponseInjector (req: Request, res: Response, next: any): void {
    res.success = function (data: any, message: string = 'Success') {
        const respons: defaultResponse = {
            message,
            errors: [],
            success: true,
            data
        };
        res.json(respons);
    };

    res.fail = function (message: string, errors: string[] = [], data: any = null) {
        const respons: defaultResponse = {
            message,
            errors,
            success: false,
            data
        };
        res.json(respons);
    };

    next();
}
