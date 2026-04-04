import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { createCowSchema, updateCowSchema } from './cows.schema';
import { createCow, listCows, getCow, updateCow } from './cows.controller';

export const cowsRouter = Router();

cowsRouter.get('/', listCows);
cowsRouter.post('/', validate(createCowSchema), createCow);
cowsRouter.get('/:id', getCow);
cowsRouter.patch('/:id', validate(updateCowSchema), updateCow);
