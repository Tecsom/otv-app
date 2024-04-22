import express from 'express';
import { renderClientsPage, renderHomePage, renderLoginPage, renderCatalogoInterno } from '../controllers/views';

const router = express.Router();

router.get('/', renderHomePage);
router.get('/login', renderLoginPage);
router.get('/clientes', renderClientsPage);
router.get('/catalogo/interno', renderCatalogoInterno)

export default router;
