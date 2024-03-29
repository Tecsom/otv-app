import express from 'express';
import { getHomePage } from '../controllers/home.js';

const router = express.Router();

router.get('/', getHomePage);

export default router;
