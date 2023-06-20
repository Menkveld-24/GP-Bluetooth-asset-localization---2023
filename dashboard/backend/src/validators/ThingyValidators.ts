import { IsDefined, Length, Matches } from 'class-validator';
import { type Request, type Response } from 'express';
import fs from 'fs';
import { CustomError } from '@exceptions/GenericException';
import path from 'path';
import Thingy from '@app/models/Thingy';
import { Op } from 'sequelize';
import { validateRequest } from '@validators/BaseValidator';

export class CreateNewThingyRules {
    @Length(5, 100, {
        message: 'Name must be between 5 and 100 characters long!'
    })
        name: string;

    @Length(5, 255, {
        message: 'Description must be between 5 and 255 characters long!'
    })
        description: string;

    @IsDefined()
    @Matches(/^[0-9A-F]{12}$/, {
        message:
      'MAC address must be 12 characters long and contain only capital letters!'
    })
        mac: string | undefined;
}

export async function createNewThingyValidator (req: Request, res: Response, next: any): Promise<void> {
    const errors = await validateRequest(req, res, CreateNewThingyRules);
    if (errors.length === 0) {
        const duplicateThingies = await Thingy.findAndCountAll({
            where: {
                [Op.or]: {
                    name: req.body.name,
                    mac: req.body.mac
                }
            }
        });

        if (duplicateThingies.count === 0) return next();

        errors.push('Thingy with the same name or MAC address already exists!');
    }
    try {
        if (req.file !== undefined) {
            fs.unlinkSync(req.file.path);
        }
    } catch (err) {
        console.log('Error deleting file!');
        console.error(err);
    }

    return next(new CustomError('Request validation failed!', errors));
}

export function imageValidator (req: Request, file: Express.Multer.File, callback: any): void {
    const ext = path.extname(file.originalname).toLowerCase();

    if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
        callback(new CustomError('Only images are allowed', [`Received file with extension ${ext}`]));
        return;
    }

    callback(null, true);
}
