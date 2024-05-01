import { createUsuarioC, getUsuariosC } from '@/controllers/usuarios';
import express from 'express';

const router = express.Router();

router.get('/usuarios', getUsuariosC);
router.post('/usuarios', createUsuarioC);

export default router;
