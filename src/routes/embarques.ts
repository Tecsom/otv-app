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
    updateContenedorEmbarque,
    getProductosInOrderByEmbarque,
    postDestinos,
    getDestinoEmbarque,
    deleteDestinoEmbarque,
    createCodigoContenedor,
    getAllEmbarqueContenedorCodigo,
    getAllDataFromEmbarque,
    verifyContainersEmbarque,
    getContainersVerified,
    putDestino,
    
} from '../controllers/embarques'


const router = express.Router()

router.get('/embarques', getEmbarques);

router.get('/embarques/paging', getEmbarques);

router.get('/embarque/:id', showEmbarqueById);
router.put('/embarque/:id', updateEmbarque);
router.delete('/embarque/:id', deleteEmbarque);
router.post('/embarque/create', createEmbarque)

router.get('/embarques/all/:embarque_id', getAllDataFromEmbarque)

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

router.get('/ordenes/embarques/:order_id', getProductosInOrderByEmbarque)


router.get('/destinos/:embarque_id', getDestinoEmbarque) 
router.post('/destinos/create', postDestinos)
router.put('/destinos/:destino_id', putDestino)
router.delete('/destinos/:destino_id', deleteDestinoEmbarque)

router.post('/embarques/codigo/contenedor', createCodigoContenedor)
router.get('/embarque/codigo/contenedor/:embarque_id', getAllEmbarqueContenedorCodigo)

router.post('/embarques/verificar', verifyContainersEmbarque)
router.get('/embarques/verificaciones/:embarque_id', getContainersVerified)

export default router;