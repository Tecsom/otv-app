import express from 'express';
import {
  renderClientsPage,
  renderHomePage,
  renderLoginPage,
  renderCatalogoInterno,
  renderClientPage
} from '../controllers/views';

const router = express.Router();

router.get('/', renderHomePage);
router.get('/login', renderLoginPage);
router.get('/clientes', renderClientsPage);
router.get('/clientes/:id', renderClientPage);
router.get('/catalogo', renderCatalogoInterno);

export default router;
