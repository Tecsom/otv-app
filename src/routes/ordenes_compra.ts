import express from 'express';
import { getOrdenes } from '../controllers/ordenes_compra';

const router = express.Router();

router.get('/ordenes', getOrdenes);

export default router;
