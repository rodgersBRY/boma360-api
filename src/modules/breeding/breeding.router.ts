import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { createBreedingRecordSchema } from './breeding.schema';
import { createBreedingRecord, listBreedingRecords, getBreedingRecord } from './breeding.controller';

export const breedingRouter = Router();

breedingRouter.get('/:cowId/breeding-records', listBreedingRecords);
breedingRouter.post('/:cowId/breeding-records', validate(createBreedingRecordSchema), createBreedingRecord);
breedingRouter.get('/:cowId/breeding-records/:id', getBreedingRecord);
