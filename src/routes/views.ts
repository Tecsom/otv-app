import express from 'express';
import { renderClientsPage, renderHomePage, renderLoginPage } from '../controllers/views';

const router = express.Router();

router.get('/', renderHomePage);
router.get('/login', renderLoginPage);
router.get('/clientes', renderClientsPage);

export default router;
