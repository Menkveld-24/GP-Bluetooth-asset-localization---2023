declare module "some-untyped-module";
declare namespace Express {

    // Inject additional properties on express.Response
    interface Response {
        /**
         * Send a success response in the default format
         *
         * @param data the Response data field to populate
         * @param message the Response message field to populate
         *
         * @example
         * res.success({ foo: 'bar' }, 'Success')
         * res.success('My data field')
         */
        success: (data: any, message?: string) => void

        /**
         * Send a failure response in the default format
         *
         * @param message the Response message field to populate
         * @param errors the Response errors field to populate
         *
         * @example
         * res.fail('Failure', ['Error 1', 'Error 2'])
         * res.fail('Failure')
         */
        fail: (message: string, errors?: string[], data?: any) => void
    }

    interface Request {
        validateBody: (validatorClass: any) => Promise<void>
}

// import type * as core from 'express-serve-static-core';

// declare module 'express' {
//     interface Response extends core.Response {
//         /**
//          * Send a success response in the default format
//          *
//          * @param data the Response data field to populate
//          * @param message the Response message field to populate
//          *
//          * @example:
//          * res.success({ foo: 'bar' }, 'Success')
//          * res.success('My data field')
//          */
//         success: (data: any, message: string) => void

//         /**
//          * Send a failure response in the default format
//          *
//          * @param message the Response message field to populate
//          * @param errors the Response errors field to populate
//          *
//          * @example
//          * res.fail('Failure', ['Error 1', 'Error 2'])
//          * res.fail('Failure')
//          */
//         fail: (message: string, errors: string[]) => void
//     }
// }
