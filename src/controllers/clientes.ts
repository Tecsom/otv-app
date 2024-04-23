import { Request, Response } from 'express';
import { getClientes, createCliente, getClientById, deleteCliente, updateCliente } from './../utils/clientes';
import type { Cliente } from '@/types/clientes';
import { createPieza, createRevision, uploadRevisionFiles } from '@/utils/piezas';

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

export const getClientC = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const cliente = await getClientById(id);
    res.status(200).json(cliente);
  } catch (error: any) {
    res.status(500).json(error);
  }
};

export const deleteClienteC = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const cliente = await deleteCliente(id);
    res.status(200).json({ message: 'Cliente eliminado', status: true, data: cliente });
  } catch (error: any) {
    res.status(500).json(error);
  }
};

export const updateClienteC = async (req: Request, res: Response) => {
  const id = req.params.id;
  const clienteData = req.body as Cliente;
  try {
    const cliente = await updateCliente(clienteData, id);
    res.status(200).json(cliente);
  } catch (error: any) {
    console.log({ error });
    res.status(500).json(error);
  }
};

export const createPiezaC = async (req: Request, res: Response) => {
  const { id } = req.params;
  const cliente_id = parseInt(id);
  const piezaData = req.body;
  piezaData.cliente_id = cliente_id;
  const imagenes = piezaData.imagenes;
  const archivos = piezaData.archivos;
  delete piezaData.imagenes;
  delete piezaData.archivos;

  try {
    const pieza = await createPieza(piezaData);

    if (!pieza?.id) throw new Error('Error al crear la pieza');

    const revision = await createRevision(pieza?.id, {
      nombre: '-',
      pieza_id: pieza.id
    });

    if (!revision?.id) throw new Error('Error al crear la revisión');

    await uploadRevisionFiles(cliente_id, pieza.id, revision.id, archivos);
    await uploadRevisionFiles(cliente_id, pieza.id, revision.id, imagenes);

    res.status(200).json({});
  } catch (error: any) {
    res.status(500).json(error);
  }
};
