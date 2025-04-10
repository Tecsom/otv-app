import express from 'express';
import {
  renderClientsPage,
  renderHomePage,
  renderLoginPage,
  renderClientPage,
  renderUnidadesMedida,
  renderOrdenesCompra,
  renderVerificador,
  renderVerificadorEmbarques,
  renderVerificadorOrdenes,
  renderConfiguracion,
  renderInventarios,
  renderEmbarques,
  renderProductoInventarios,
  renderUsersView,
  renderPrinLabelController
} from '../controllers/views';

const router = express.Router();

router.get('/', renderHomePage);
router.get('/login', renderLoginPage);
router.get('/clientes', renderClientsPage);
router.get('/clientes/:id', renderClientPage);
router.get('/unidades', renderUnidadesMedida);
router.get('/ordenes', renderOrdenesCompra);
router.get('/verificador', renderVerificador);
router.get('/verificador/embarques', renderVerificadorEmbarques);
router.get('/verificador/ordenes', renderVerificadorOrdenes);
router.get('/configuracion', renderConfiguracion);
router.get('/inventario', renderInventarios);
router.get('/inventario/:product_id', renderProductoInventarios);
router.get('/embarques', renderEmbarques);
router.get('/users', renderUsersView);
router.get('/printer-label', renderPrinLabelController);

export default router;
