import express from 'express'
import {
    createEmbarque,
    deleteEmbarque,
    getEmbarques,
    showEmbarque,
    updateEmbarque
} from '../controllers/embarques'


const router = express.Router()

router.get('/embarques', getEmbarques);
router.get('/embarque/:id', showEmbarque);
router.put('/embarque/:id', updateEmbarque);
router.delete('/embarque/:id', deleteEmbarque);
router.post('/embarque/create', createEmbarque)

export default router;