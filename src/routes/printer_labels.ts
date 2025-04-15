import express from 'express';

import { newPrinterLabelReq } from '@/controllers/printer-labels';

const router = express.Router();

router.post('/printer/label', newPrinterLabelReq);

export default router;
