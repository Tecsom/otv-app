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
  generateOrder,
  verifyProductsOrder,
  getStaticOrderC,
  updateOrderCodesController
} from '../controllers/ordenes_compra';

const router = express.Router();

router.get('/ordenes', getOrdenes);
router.get('/ordenes/paging', getOrdenesPagingC);
router.post('/ordenes/create', newOrder);
router.put('/ordenes/update', putOrder);
router.put('/ordenes/update-codes', updateOrderCodesController);
router.delete('/ordenes/:id/delete', deleteOrden);
router.post('/ordernes/addproduct', addProductToOrder);
router.put('/ordenes/producto/edit/', editOrderProduct);
router.delete('/ordenes/producto/delete/:product_id', deleteOrderProduct);
router.post('/ordenes/verificar', verifyProductsOrder);
router.get('/ordenes/:order_id/productos', getOrderProducts);
router.post('/ordenes/:order_id/files', postFiles);
router.get('/ordenes/:order_id/files', getFilesC);
router.post('/ordenes/generar', generateOrder);
router.get('/ordenes/estaticas/:order_id', getStaticOrderC);

export default router;
