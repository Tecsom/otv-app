import express from 'express';
import { getUMedida, addNewMedida } from '../controllers/unidades_medida';

const router = express.Router();

router.get('/unidades/medida', getUMedida);
router.post('/unidades/medida/new', addNewMedida);


export default router;
