import { Request, Response } from 'express';
import { getOrdenesCompra, createNewOrder } from './../utils/ordenes_compra';
import { CreateOrderDataModel } from '@/types/ordenes_compra';

export const getOrdenes = async (req: Request, res: Response) => {
    try {
        const ordenes = await getOrdenesCompra();
        res.status(200).json(ordenes);
    } catch (error: any) {
        res.status(500).json(error);
    }
};

export const newOrder = async (req: Request, res: Response) => {
    const payload: CreateOrderDataModel = req.body

    const createResult = await createNewOrder(payload)

}
