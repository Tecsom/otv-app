import { LoginC } from '@/controllers/auth';
import express from 'express';

const router = express.Router();

router.post('/login', LoginC);

export default router;
