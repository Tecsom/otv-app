import express from 'express';
import * as MovementsRouter from '../controllers/movements';

const router = express.Router();

router.put('/movements', MovementsRouter.upsertMovementsController);
router.get('/movements/:individual_id', MovementsRouter.getMovements);
router.delete('/movements/:movement_id', MovementsRouter.deleteMovementController);

export default router;
