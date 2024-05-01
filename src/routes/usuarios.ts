import { getUsuariosC } from '@/controllers/usuarios';
import express from 'express';

const router = express.Router();

router.get('/usuarios', getUsuariosC);

export default router;
