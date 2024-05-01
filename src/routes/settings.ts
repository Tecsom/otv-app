import { validatePassword, updatePassword } from '@/controllers/settings';
import express from 'express';

const router = express.Router();

router.get('/settings/quit-checker', validatePassword);
router.put('/settings/verificador/password/update', updatePassword)

export default router;
