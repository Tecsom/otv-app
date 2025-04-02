import {
  createUsuarioC,
  deleteUsuarioC,
  editUsuarioC,
  getUsersTableController,
  getUsuariosC
} from '@/controllers/usuarios';
import express from 'express';

const router = express.Router();

router.get('/usuarios', getUsuariosC);
router.get('/usuarios-table', getUsersTableController);
router.post('/usuarios', createUsuarioC);
router.put('/usuarios', editUsuarioC);
router.delete('/usuarios/:id', deleteUsuarioC);

export default router;
