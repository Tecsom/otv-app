import express from 'express';
import {
  createClienteC,
  getClientesC,
  deleteClienteC,
  updateClienteC,
  createPiezaC,
  editPiezaC,
  getRevisionesByPiezaC,
  getPiezasByClienteC,
  getFilesByRevisionC,
  updateRevisionC,
  createRevisionC
} from '../controllers/clientes';

const router = express.Router();

router.get('/clientes', getClientesC);
router.post('/clientes', createClienteC);
router.delete('/clientes/:id', deleteClienteC);
router.put('/clientes/:id', updateClienteC);

// Piezas
router.get('/clientes/:id/piezas', getPiezasByClienteC);
router.post('/clientes/:id/piezas', createPiezaC);
router.put('/clientes/:cliente_id/piezas', editPiezaC);
router.get('/clientes/:cliente_id/piezas/:pieza_id/revisiones', getRevisionesByPiezaC);

//Revisiones
router.get('/clientes/:cliente_id/piezas/:pieza_id/revisiones/:revision_id/files', getFilesByRevisionC);
router.put('/clientes/:cliente_id/piezas/:pieza_id/revisiones/:revision_id', updateRevisionC);
router.post('/clientes/:cliente_id/piezas/:pieza_id/revisiones', createRevisionC);

export default router;
