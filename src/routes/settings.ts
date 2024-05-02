import { validatePassword, updateCheckerPass, saveDefaultScannerPort } from '@/controllers/settings';
import express from 'express';

const router = express.Router();

router.get('/settings/quit-checker', validatePassword);
router.put('/settings/verificador/password/update', updateCheckerPass);
router.post('/settings/verificador/port', saveDefaultScannerPort);

export default router;
