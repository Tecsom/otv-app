import express from 'express';
import { createClienteC, getClientesC, deleteClienteC, updateClienteC } from '../controllers/clientes';

const router = express.Router();

router.get('/clientes', getClientesC);
router.post('/clientes', createClienteC);
router.delete('/clientes/:id', deleteClienteC);
router.put('/clientes/:id', updateClienteC);

export default router;
