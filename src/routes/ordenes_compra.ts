import express from 'express';
import { getOrdenes, newOrder, getOrdenesPagingC, addProductToOrder, getOrderProducts } from '../controllers/ordenes_compra';

const router = express.Router();

router.get('/ordenes', getOrdenes);
router.get('/ordenes/paging', getOrdenesPagingC);
router.post('/ordenes/create', newOrder);
router.post('/ordernes/addproduct', addProductToOrder)
router.get('/ordenes/:order_id/productos', getOrderProducts)

export default router;
