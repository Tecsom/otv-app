import express from 'express';
import * as InventoryRouter from '../controllers/inventory';

const router = express.Router();

router.get('/inventory/paging', InventoryRouter.getInventoryPaging);
router.post('/inventory', InventoryRouter.createProductController);
router.put('/inventory', InventoryRouter.updateProductController);
router.delete('/inventory/:product_id', InventoryRouter.deleteProductController);

router.post('/inventory/:product_id/individual', InventoryRouter.createIndividualProductController);
router.get('/inventory/:product_id/individual', InventoryRouter.getIndividualProductsByProductIdController);
router.put('/inventory/:product_id/individual', InventoryRouter.updateIndividualProductController);

export default router;
