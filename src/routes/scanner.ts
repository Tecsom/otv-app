import express from 'express';
import { listPorts } from '../controllers/scanner';

const router = express.Router();

router.get('/list/ports', listPorts);

export default router;
