import express from 'express';

import { getPrinterLabelsReq, newPrinterLabelReq } from '@/controllers/printer-labels';

const router = express.Router();

router.get('/printer/label', getPrinterLabelsReq);
router.post('/printer/label', newPrinterLabelReq);

export default router;
