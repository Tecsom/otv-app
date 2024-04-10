import express from 'express';
import { renderHomePage, renderLoginPage } from '../controllers/views.js';

const router = express.Router();

router.get('/', renderHomePage);
router.get('/login', renderLoginPage);

export default router;
