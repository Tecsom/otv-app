import { Request, Response } from 'express';
import { getOrdenesCompra } from './../utils/ordenes_compra';

export const getOrdenes = async (req: Request, res: Response) => {
    try {
        const ordenes = await getOrdenesCompra();
        res.status(200).json(ordenes);
    } catch (error: any) {
        res.status(500).json(error);
    }
};
