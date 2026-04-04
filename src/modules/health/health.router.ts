import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { createHealthRecordSchema, updateHealthRecordSchema } from './health.schema';
import { createHealthRecord, listHealthRecords, getHealthRecord, updateHealthRecord } from './health.controller';

export const healthRouter = Router();

healthRouter.get('/:cowId/health-records', listHealthRecords);
healthRouter.post('/:cowId/health-records', validate(createHealthRecordSchema), createHealthRecord);
healthRouter.get('/:cowId/health-records/:id', getHealthRecord);
healthRouter.patch('/:cowId/health-records/:id', validate(updateHealthRecordSchema), updateHealthRecord);
