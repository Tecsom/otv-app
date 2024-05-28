import express from 'express'
import {
    createEmbarque,
    deleteEmbarque,
    getEmbarques,
    getOrdenes,
    indexEmbarqueProduct,
    newEmbarqueProduct,
    showEmbarque,
    updateEmbarque,
    deleteProductEmbarque,
    createEmbarqueContenedores,
    getEmbarqueContenedores
} from '../controllers/embarques'


const router = express.Router()

router.get('/embarques', getEmbarques);
router.get('/embarque/:id', showEmbarque);
router.put('/embarque/:id', updateEmbarque);
router.delete('/embarque/:id', deleteEmbarque);
router.post('/embarque/create', createEmbarque)

router.get('/embarques/ordenes', getOrdenes)

router.post('/embarques/productos', newEmbarqueProduct)
router.get('/embarques/:embarque_id/productos', indexEmbarqueProduct)
router.delete('/embarque/productos/:embarque_product_id', deleteProductEmbarque)

router.post('/embarque/create/contenedor', createEmbarqueContenedores)
router.get('embarque/contenedores/:embarque_id', getEmbarqueContenedores)

export default router;