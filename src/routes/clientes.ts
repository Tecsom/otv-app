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
  getClientesPagingC,
  updateProfilePhotoC,
  getProfilePhotoC,
  getHistoryOrders,
  getHistoryShips
} from '../controllers/clientes';

const router = express.Router();

router.get('/clientes', getClientesC);
router.get('/clientes/paging', getClientesPagingC);
router.post('/clientes', createClienteC);
router.delete('/clientes/:id', deleteClienteC);
router.put('/clientes/:id', updateClienteC);
router.put('/clientes/:id/update-photo', updateProfilePhotoC);
router.get('/clientes/:id/profile-photo', getProfilePhotoC);

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

router.get('/clientes/historial/ordenes/:cliente_id', getHistoryOrders)
router.get('/cliente/historial/embarques/:cliente_id', getHistoryShips)

export default router;
