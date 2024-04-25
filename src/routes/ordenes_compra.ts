import express from 'express';
import {
  getOrdenes,
  newOrder,
  getOrdenesPagingC,
  addProductToOrder,
  getOrderProducts,
  postFiles,
  getFilesC,
  putOrder,
  deleteOrden,
  deleteOrderProduct,
  editOrderProduct,
  generateOrder
} from '../controllers/ordenes_compra';

const router = express.Router();

router.get('/ordenes', getOrdenes);
router.get('/ordenes/paging', getOrdenesPagingC);
router.post('/ordenes/create', newOrder);
router.put('/ordenes/update', putOrder);
router.delete('/ordenes/:id/delete', deleteOrden);
router.post('/ordernes/addproduct', addProductToOrder);
router.put('/ordenes/producto/edit/', editOrderProduct);
router.delete('/ordenes/producto/delete/:product_id', deleteOrderProduct);
router.get('/ordenes/:order_id/productos', getOrderProducts);
router.post('/ordenes/:order_id/files', postFiles);
router.get('/ordenes/:order_id/files', getFilesC);
router.post('/ordenes/generar', generateOrder);

export default router;
