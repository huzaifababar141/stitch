import { Router } from 'express';
import * as productsController from './products.controller';
import { validate } from '../../middleware/validate.middleware';
import { parseProductLinkSchema } from './products.validator';

const router = Router();

// Public / Authenticated route to parse product link
router.post('/parse-link', validate(parseProductLinkSchema), productsController.parseProductLink);

// Public route to get product by ID
router.get('/:id', productsController.getProductById);

export default router;
