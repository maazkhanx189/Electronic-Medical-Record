import express from 'express';
import { createBackup, getBackups, downloadBackup, deleteBackup, restoreBackup } from '../controllers/backup_controller.js';
import { isAdmin, protect } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);
router.use(isAdmin);

router.post('/create', createBackup);
router.get('/list', getBackups);
router.get('/download/:filename', downloadBackup);
router.delete('/:filename', deleteBackup);
router.post('/restore', restoreBackup);

export default router;
