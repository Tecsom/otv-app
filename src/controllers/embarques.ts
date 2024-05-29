import { Request, Response } from 'express'
import { Embarque } from '@/types/embarques'
import { newEmbarque, createEmbarqueProduct, delEmbarque, getEmbarqueProducts, getOrdenesStatic, listEmbarques, getEmbarqueById, updtEmbarque, deleteProductFromEmbarque, createNewEmbarqueContenedor, getContenedoresByEmbarque, changeStateToEmbarque, deleteContainerInEmbarque, updateContainerInEmbarque } from '@/utils/embarques';

export const getEmbarques = async (req: Request, res: Response) => {

    try {
        const ordenes = await listEmbarques();
        res.status(200).json(ordenes)
    } catch (error: any) {
        res.status(500).json(error)
    }
}

export const showEmbarqueById = async (req: Request, res: Response) => {
    try {
        const embarque_id = req.params.id;
        const embarque = await getEmbarqueById(parseInt(embarque_id))

        res.status(200).json(embarque)

    } catch (error) {
        res.status(500).json(error)
    }
}

export const deleteEmbarque = async (req: Request, res: Response) => {
    try {
        const embarque_id = req.params.id
        const embarqueDeleted = await delEmbarque(parseInt(embarque_id))

        res.status(200).json({ embarqueDeleted })

    } catch (error) {
        res.status(500).json(error)
    }
}

export const updateEmbarque = async (req: Request, res: Response) => {
    try {
        const embarque_data = req.body
        const embarque_id = req.params.id
        const updateEmbarque = await updtEmbarque(embarque_data, parseInt(embarque_id));

        res.status(200).json(updateEmbarque)
    } catch (error) {
        res.status(500).json(error)
    }
}

export const createEmbarque = async (req: Request, res: Response) => {
    try {
        const embarque_data = req.body;
        const nuevoEmbarque = await newEmbarque(embarque_data);

        res.status(201).json({ nuevoEmbarque })

    } catch (error) {
        res.status(500).json(error)
    }
}

export const getOrdenes = async (req: Request, res: Response) => {
    try {
        const ordenes = await getOrdenesStatic();

        res.status(200).json(ordenes)
    } catch (error: any) {
        res.status(500).json(error)
    }
}

export const newEmbarqueProduct = async (req: Request, res: Response) => {
    try {
        const newEmbarqueProducto = await createEmbarqueProduct(req.body);

        res.status(201).json({newEmbarqueProducto})
    } catch (error) {
        console.error(error)
        throw error
    }
}
export const indexEmbarqueProduct = async (req: Request, res: Response) => {
    try {
        const embarque_id = req.params.embarque_id;
        const embarque = await getEmbarqueProducts(parseInt(embarque_id))

        res.status(200).json(embarque)

    } catch (error) {
        res.status(500).json(error)
    }
}

export const deleteProductEmbarque = async (req: Request, res: Response) => {
    try {
        const contenedor_productos_id = req.params.contenedor_productos_id;
        const contenedor_id = req.body.contenedor_id;
        const cantidad = req.body.cantidad;
        const embarqueDeleted = await deleteProductFromEmbarque(parseInt(contenedor_productos_id), parseInt(contenedor_id), parseInt(cantidad))

        res.status(200).json({ embarqueDeleted })
    } catch (error) {
        res.status(500).json({error: error})
    }
}

export const createEmbarqueContenedores = async (req:Request, res: Response) => {
    try {
        const contenedor_data = req.body
        const embarque_id = req.params.embarque_id
        const newEmbarque = createNewEmbarqueContenedor(contenedor_data, parseInt(embarque_id));

        res.status(201).json(newEmbarque)
    } catch (error) {
        res.status(500).json(error)
    }
}

export const getEmbarqueContenedores = async (req: Request, res: Response) => {
    try {
        const embarque_id = req.params.embarque_id
        const contenedoresByEmbarque = await getContenedoresByEmbarque(parseInt(embarque_id))

        res.status(200).json(contenedoresByEmbarque)
    } catch (error) {
        res.status(500).json(error)
    }
}

export const EditEstadoEmbarque = async(req:Request, res:Response) => {
    try {
        
        const embarque_id = req.params.embarque_id
        const estado = req.body.estado
        const statusChanged = await changeStateToEmbarque(parseInt(embarque_id), estado)

        res.status(200).json(statusChanged)
    } catch (error) {
        res.status(500).json(error)
    }
}

export const getContenedoresEmbarque = async ( req: Request, res: Response) => {
    try {
        
        const embarque_id = req.params.embarque_id
        const data = await getContenedoresByEmbarque(parseInt(embarque_id))

        res.status(200).json(data);

    } catch (error) {
        res.status(500).json(error);
    }
}

export const deleteContenedorEmbarque = async (req:Request, res:Response) => {
    try {
        const contenedor_id = req.params.contenedor_id;
        const data = await deleteContainerInEmbarque(parseInt(contenedor_id));

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json(error)
    }
}

export const updateContenedorEmbarque = async (req:Request, res:Response) => {
    try {
        const payload = req.body;
        const contenedor_id = req.params.contenedor_id;

        const data = await updateContainerInEmbarque(parseInt(contenedor_id), payload);
        
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json(error)
    }
}