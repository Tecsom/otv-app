import express from 'express';
import { getUMedida, addNewMedida, editMedida } from '../controllers/unidades_medida';

const router = express.Router();

router.get('/unidades/medida', getUMedida);
router.post('/unidades/medida/new', addNewMedida);
router.put('/unidades/medida/edit', editMedida)


export default router;
