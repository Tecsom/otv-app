import { validatePassword } from '@/controllers/settings';
import express from 'express';

const router = express.Router();

router.get('/settings/quit-checker', validatePassword);

export default router;
