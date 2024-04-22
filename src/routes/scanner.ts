import express from 'express';
import { listPorts, readScanner } from '../controllers/scanner';

const router = express.Router();

router.get('/list/ports', listPorts);
router.get('/scanner/read', readScanner);

export default router;
