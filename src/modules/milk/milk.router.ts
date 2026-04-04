import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { createMilkLogSchema, updateMilkLogSchema } from './milk.schema';
import { createMilkLog, listMilkLogs, updateMilkLog } from './milk.controller';

export const milkRouter = Router();

milkRouter.get('/:cowId/milk-logs', listMilkLogs);
milkRouter.post('/:cowId/milk-logs', validate(createMilkLogSchema), createMilkLog);
milkRouter.patch('/:cowId/milk-logs/:id', validate(updateMilkLogSchema), updateMilkLog);
