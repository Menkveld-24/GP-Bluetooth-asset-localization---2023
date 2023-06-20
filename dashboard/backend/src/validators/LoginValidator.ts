import { IsDefined, Length, Matches } from 'class-validator';
import { type Request, type Response } from 'express';
import { CustomError } from '@exceptions/GenericException';
import { validateRequest } from '@validators/BaseValidator';

export class CreateNewThingyRules {
    @IsDefined()
    @Matches(/^[a-zA-Z0-9 ]+$/, {
        message:
      'Username can only contain letters, spaces and numbers!'
    })
    @Length(5, 100, {
        message: 'Username must be between 5 and 100 characters long!'
    })
        username: string;

    @IsDefined()
    @Matches(/^[a-zA-Z0-9!@#$%^&*?]+$/, {
        message:
        'Password can only contain letters, and numbers and special characters!'
    })
    @Matches(/(?=.*[!@#$%^&*?])/, {
        message:
        'Password must contain at least one special character! (!@#$%^&*?)'
    })
    @Length(5, 255, {
        message: 'Password must be between 5 and 255 characters long!'
    })
        password: string;
}

export async function loginValidator (req: Request, res: Response, next: any): Promise<void> {
    const errors = await validateRequest(req, res, CreateNewThingyRules);
    if (errors.length === 0) {
        return next();
    }

    return next(new CustomError('Request validation failed!', errors));
}
