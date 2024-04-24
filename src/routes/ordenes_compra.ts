import express from 'express';
import {
  getOrdenes,
  newOrder,
  getOrdenesPagingC,
  addProductToOrder,
  getOrderProducts,
  postFiles,
  getFilesC
} from '../controllers/ordenes_compra';

const router = express.Router();

router.get('/ordenes', getOrdenes);
router.get('/ordenes/paging', getOrdenesPagingC);
router.post('/ordenes/create', newOrder);
router.post('/ordernes/addproduct', addProductToOrder);
router.get('/ordenes/:order_id/productos', getOrderProducts);
router.post('/ordenes/:order_id/files', postFiles);
router.get('/ordenes/:order_id/files', getFilesC);

export default router;
