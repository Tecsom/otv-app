import express from 'express';
import { createClienteC, getClientesC } from '../controllers/clientes';

const router = express.Router();

router.get('/clientes', getClientesC);
router.post('/clientes', createClienteC);

export default router;
