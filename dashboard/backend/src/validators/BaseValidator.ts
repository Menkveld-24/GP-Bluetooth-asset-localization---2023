import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { type Request, type Response } from 'express';

export async function validateRequest (
    request: Request,
    response: Response,
    validatorClass: any
): Promise<string[]> {
    const convertedObject = plainToInstance(validatorClass, request.body);
    const errors = await validate(convertedObject);
    if (errors.length <= 0) return [];

    let rawErrors: string[] = [];
    for (const errorItem of errors) {
        rawErrors = rawErrors.concat(
            ...rawErrors,
            Object.values(errorItem.constraints ?? [])
        );
    }
    rawErrors = rawErrors.filter((item, index, array) => array.indexOf(item) === index);

    return rawErrors;
}