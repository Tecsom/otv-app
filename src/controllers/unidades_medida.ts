import { Request, Response } from 'express';
import { getUnidadesMedida, createMedida } from './../utils/unidades_medida';
import { UnidadMedida } from '@/types/unidades_medida';

export const getUMedida = async (_: Request, res: Response) => {
    try {
        const unidadesDeMedida = await getUnidadesMedida();
        res.status(200).json(unidadesDeMedida);
    } catch (error) {
        res.status(500).json(error);
    }
};

export const addNewMedida = async (req: Request, res: Response) => {
    try {
        const newMedida = req.body as UnidadMedida;
        const result = await createMedida(newMedida);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

export const editMedida = async (req: Request, res: Response) => {
    try {
        const newMedida = req.body as UnidadMedida;
        const result = await createMedida(newMedida);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json(error);
    }
}

// export const createClienteC = async (req: Request, res: Response) => {
//   const clienteData = req.body as Cliente;
//   try {
//     const cliente = await createCliente(clienteData);
//     res.status(200).json({ message: 'Cliente creado', status: true, data: cliente });
//   } catch (error: any) {
//     res.status(500).json(error);
//   }
// };

// export const getClientC = async (req: Request, res: Response) => {
//   const { id } = req.params;
//   try {
//     const cliente = await getClientById(id);
//     res.status(200).json(cliente);
//   } catch (error: any) {
//     res.status(500).json(error);
//   }
// };
