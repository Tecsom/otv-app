import express from 'express';
import { getOrdenes, newOrder, getOrdenesPagingC } from '../controllers/ordenes_compra';

const router = express.Router();

router.get('/ordenes', getOrdenes);
router.get('/ordenes/paging', getOrdenesPagingC);
router.post('/ordenes/create', newOrder);

export default router;
