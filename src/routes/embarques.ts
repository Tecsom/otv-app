import express from 'express'
import {
    createEmbarque,
    deleteEmbarque,
    getEmbarques,
    getOrdenes,
    indexEmbarqueProduct,
    newEmbarqueProduct,
    showEmbarqueById,
    updateEmbarque,
    deleteProductEmbarque,
    createEmbarqueContenedores,
    getEmbarqueContenedores,
    EditEstadoEmbarque
} from '../controllers/embarques'


const router = express.Router()

router.get('/embarques', getEmbarques);
router.get('/embarque/:id', showEmbarqueById);
router.put('/embarque/:id', updateEmbarque);
router.delete('/embarque/:id', deleteEmbarque);
router.post('/embarque/create', createEmbarque)

router.get('/embarques/ordenes', getOrdenes)

router.post('/embarques/productos', newEmbarqueProduct)
router.get('/embarques/:embarque_id/productos', indexEmbarqueProduct)
router.delete('/embarque/productos', deleteProductEmbarque)

router.post('/embarque/create/contenedor', createEmbarqueContenedores)
router.get('/embarque/contenedores/:embarque_id', getEmbarqueContenedores)

router.put('/embarque/estado/:embarque_id', EditEstadoEmbarque)
export default router;