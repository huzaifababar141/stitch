import { Router } from 'express';
import * as measurementsController from './measurements.controller';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import {
  createMeasurementSchema,
  updateMeasurementSchema,
} from './measurements.validator';

const router = Router();

// Protect all measurement routes with JWT authentication
router.use(authenticate);

router.get('/', measurementsController.listMeasurements);
router.post('/', validate(createMeasurementSchema), measurementsController.createMeasurement);
router.get('/:id', measurementsController.getMeasurementById);
router.patch('/:id', validate(updateMeasurementSchema), measurementsController.updateMeasurement);
router.delete('/:id', measurementsController.deleteMeasurement);
router.patch('/:id/default', measurementsController.setDefaultMeasurement);
router.post('/:id/validate-ai', measurementsController.validateMeasurementWithAI);

export default router;
