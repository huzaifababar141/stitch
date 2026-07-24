import { Router } from 'express';
import multer from 'multer';
import * as usersController from './users.controller';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import {
  updateProfileSchema,
  createAddressSchema,
  updateAddressSchema,
} from './users.validator';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

const router = Router();

// Protect all user routes with JWT authentication
router.use(authenticate);

// User Profile routes
router.get('/profile', usersController.getProfile);
router.patch('/profile', validate(updateProfileSchema), usersController.updateProfile);
router.post('/profile/image', upload.single('image'), usersController.uploadProfileImage);

// Address Management routes
router.get('/addresses', usersController.listAddresses);
router.post('/addresses', validate(createAddressSchema), usersController.createAddress);
router.patch('/addresses/:id', validate(updateAddressSchema), usersController.updateAddress);
router.delete('/addresses/:id', usersController.deleteAddress);
router.patch('/addresses/:id/default', usersController.setDefaultAddress);

export default router;
