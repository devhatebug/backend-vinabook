import express from 'express';
import {
    getLabels,
    createLabel,
    deleteLabel,
    getLabelsPagination,
    updateLabel,
} from '../controllers/label';
import authMiddleware from '../middlewares/auth';

const router = express.Router();

router.get('/get-all', authMiddleware, getLabels);
router.get('/pagination', authMiddleware, getLabelsPagination);
router.post('/', authMiddleware, createLabel);
router.delete('/:labelId', authMiddleware, deleteLabel);
router.put('/:labelId', authMiddleware, updateLabel);

export default router;
