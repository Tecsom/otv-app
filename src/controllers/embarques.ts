import { Request, Response } from 'express'
import { Embarque } from '@/types/embarques'
import { create, eliminarEmbarque, getOrdenesStatic, index, show, update } from '@/utils/embarques';

export const getEmbarques = async (req: Request, res: Response) => {

    try {
        const ordenes = await index();
        res.status(200).json(ordenes)
    } catch (error: any) {
        res.status(500).json(error)
    }
}

export const showEmbarque = async (req: Request, res: Response) => {
    try {
        const embarque_id = req.params.id;
        const embarque = await show(parseInt(embarque_id))

        res.status(200).json(embarque)

    } catch (error) {
        res.status(500).json(error)
    }
}

export const deleteEmbarque = async (req: Request, res: Response) => {
    try {
        const embarque_id = req.params.id
        const embarqueDeleted = await eliminarEmbarque(parseInt(embarque_id))

        res.status(200).json({ embarqueDeleted })

    } catch (error) {
        res.status(500).json(error)
    }
}

export const updateEmbarque = async (req: Request, res: Response) => {
    try {
        const embarque_data = req.body
        const embarque_id = req.params.id
        const updateEmbarque = await update(embarque_data, parseInt(embarque_id));

        res.status(200).json(updateEmbarque)
    } catch (error) {
        res.status(500).json(error)
    }
}

export const createEmbarque = async (req: Request, res: Response) => {
    try {
        const embarque_data = req.body;
        const newEmbarque = await create(embarque_data);

        res.status(201).json({ newEmbarque })

    } catch (error) {
        res.status(500).json(error)
    }
}

export const getOrdenes = async (req: Request, res: Response) => {
    try {
        const ordenes = await getOrdenesStatic();
        console.log(ordenes)

        res.status(200).json(ordenes)
    } catch (error: any) {
        res.status(500).json(error)
    }
}

//export const createEmbarqueProduct = async (req: Request, res: Response) => {
//    try {
//        const newEmbarqueProducto = await createEmbarqueProduct(req.body);
//    } catch (error) {
//        
//    }
//}