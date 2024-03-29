import express from 'express';
import { getPage2 } from '../controllers/page2.js';

const router = express.Router();

router.get('/page2', getPage2);

export default router;
