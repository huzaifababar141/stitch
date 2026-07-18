import { Router } from 'express';
import { checkHealth, checkReadiness, checkLiveness } from './health.controller';

const router = Router();

router.get('/', checkHealth);
router.get('/ready', checkReadiness);
router.get('/live', checkLiveness);

export default router;
