import express from 'express';
import { getOrdenes, newOrder } from '../controllers/ordenes_compra';

const router = express.Router();

router.get('/ordenes', getOrdenes);
router.post('/ordenes/create', newOrder);


export default router;
