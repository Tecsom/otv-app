import express from 'express';
import {
    renderClientsPage,
    renderHomePage,
    renderLoginPage,
    renderClientPage,
    renderUnidadesMedida,
    renderOrdenesCompra
} from '../controllers/views';

const router = express.Router();

router.get('/', renderHomePage);
router.get('/login', renderLoginPage);
router.get('/clientes', renderClientsPage);
router.get('/clientes/:id', renderClientPage);
router.get('/unidades', renderUnidadesMedida)
router.get('/ordenes', renderOrdenesCompra)

export default router;
