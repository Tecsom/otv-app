import { Request, Response } from 'express';
import { getClientes, createCliente } from './../utils/clientes';
import type { Cliente } from '@/types/clientes';

export const getClientesC = async (req: Request, res: Response) => {
  try {
    const clientes = await getClientes();
    res.status(200).json(clientes);
  } catch (error: any) {
    res.status(500).json(error);
  }
};

export const createClienteC = async (req: Request, res: Response) => {
  const clienteData = req.body as Cliente;
  try {
    const cliente = await createCliente(clienteData);
    res.status(200).json({ message: 'Cliente creado', status: true, data: cliente });
  } catch (error: any) {
    res.status(500).json(error);
  }
};
