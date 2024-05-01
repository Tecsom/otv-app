import { createUsuarioC, deleteUsuarioC, editUsuarioC, getUsuariosC } from '@/controllers/usuarios';
import express from 'express';

const router = express.Router();

router.get('/usuarios', getUsuariosC);
router.post('/usuarios', createUsuarioC);
router.put('/usuarios', editUsuarioC);
router.delete('/usuarios/:id', deleteUsuarioC);

export default router;
