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
    EditEstadoEmbarque,
    deleteContenedorEmbarque,
    updateContenedorEmbarque
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
router.put('/embarque/productos/:contenedor_productos_id', deleteProductEmbarque)

router.post('/embarque/:embarque_id/contenedor', createEmbarqueContenedores)
router.get('/embarque/contenedores/:embarque_id', getEmbarqueContenedores)

router.put('/embarque/estado/:embarque_id', EditEstadoEmbarque)

router.get('/embarques/contenedores/:embarque_id', getEmbarqueContenedores )
router.delete('/embarque/contenedor/:contenedor_id', deleteContenedorEmbarque)
router.put('/embarque/contenedor/:contenedor_id', updateContenedorEmbarque)

export default router;