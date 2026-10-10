import { Router } from 'express';
import { createRecord, deleteRecord, getRecord, listRecords, updateRecord } from '../controllers/recordsController.js';
import { dashboard, reports } from '../controllers/analyticsController.js';
import authenticate from '../middleware/auth.js';
import asyncHandler from '../middleware/asyncHandler.js';

const router = Router();
router.use(authenticate);
router.get('/dashboard', asyncHandler(dashboard));
router.get('/reports', asyncHandler(reports));
router.get('/:resource', asyncHandler(listRecords));
router.post('/:resource', asyncHandler(createRecord));
router.get('/:resource/:id', asyncHandler(getRecord));
router.patch('/:resource/:id', asyncHandler(updateRecord));
router.delete('/:resource/:id', asyncHandler(deleteRecord));
export default router;
