import { Request, Response } from 'express';
import { getOrdenesCompra, createNewOrder, addOrderProduct } from './../utils/ordenes_compra';
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

    try {
        const createResult = await createNewOrder(payload);

        res.status(200).json(createResult)
    } catch (e) {
        res.status(500).json(e)
    }

}

export const addProductToOrder = async (req: Request, res: Response) => {
    const product: CreateOrderDataModel = req.body
    try {
        const createResult = await addOrderProduct(product);

        res.status(200).json(createResult)
    } catch (e) {
        res.status(500).json(e)
    }
}
