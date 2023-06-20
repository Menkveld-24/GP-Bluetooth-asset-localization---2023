import type defaultResponse from '@app/interfaces/DefaultResponseInterface';

export class CustomError extends Error {
    #errors: string[];

    constructor (message: string, errors: string[] = []) {
        super(message);
        this.#errors = errors;
    }

    toJSON (): defaultResponse {
        return {
            message: this.message,
            errors: this.#errors,
            success: false,
            data: null
        };
    }
}
