import express from 'express';
import { createClienteC, getClientesC, deleteClienteC, updateClienteC, createPiezaC } from '../controllers/clientes';

const router = express.Router();

router.get('/clientes', getClientesC);
router.post('/clientes', createClienteC);
router.delete('/clientes/:id', deleteClienteC);
router.put('/clientes/:id', updateClienteC);

router.post('/clientes/:id/piezas', createPiezaC);

export default router;
