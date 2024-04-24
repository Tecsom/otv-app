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
  createRevisionC,
  getPiezasTableC,
  deletePiezaC,
  deleteRevisionC,
  getClientesPagingC
} from '../controllers/clientes';

const router = express.Router();

router.get('/clientes', getClientesC);
router.get('/clientes/paging', getClientesPagingC);
router.post('/clientes', createClienteC);
router.delete('/clientes/:id', deleteClienteC);
router.put('/clientes/:id', updateClienteC);

// Piezas
router.get('/clientes/:id/piezas', getPiezasByClienteC);
router.get('/clientes/:id/piezas/paging', getPiezasTableC);
router.post('/clientes/:id/piezas', createPiezaC);
router.put('/clientes/:cliente_id/piezas', editPiezaC);
router.get('/clientes/:cliente_id/piezas/:pieza_id/revisiones', getRevisionesByPiezaC);
router.delete('/clientes/:cliente_id/piezas/:pieza_id', deletePiezaC);

//Revisiones
router.get('/clientes/:cliente_id/piezas/:pieza_id/revisiones/:revision_id/files', getFilesByRevisionC);
router.put('/clientes/:cliente_id/piezas/:pieza_id/revisiones/:revision_id', updateRevisionC);
router.post('/clientes/:cliente_id/piezas/:pieza_id/revisiones', createRevisionC);
router.delete('/clientes/:cliente_id/piezas/:pieza_id/revisiones/:revision_id', deleteRevisionC);

export default router;
