import express from 'express';
import { listPorts, readScanner, initScanner } from '../controllers/scanner';

const router = express.Router();

router.get('/list/ports', listPorts);
router.get('/scanner/read', readScanner);
router.get('/scanner/init', initScanner);

export default router;
