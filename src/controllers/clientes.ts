import { Request, Response } from 'express';
import { getClientes, createCliente, getClientById, deleteCliente, updateCliente } from './../utils/clientes';
import type { Cliente } from '@/types/clientes';
import {
  createPieza,
  createRevision,
  getNextNombreRevision,
  getPiezas,
  getRevisionesByPiezaId,
  updatePieza,
  uploadRevisionFiles
} from '@/utils/piezas';
import { deleteFile, deleteFolder, getFilePublicURL, getFilesByPath } from '@/utils/storage';

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

export const editPiezaC = async (req: Request, res: Response) => {
  const { cliente_id } = req.params;
  const piezaData = req.body;

  try {
    const pieza = await updatePieza(piezaData.id, piezaData);

    res.status(200).json({});
  } catch (error: any) {
    res.status(500).json(error);
  }
};

export const getRevisionesByPiezaC = async (req: Request, res: Response) => {
  const { id, pieza_id } = req.params;
  try {
    const revisiones = await getRevisionesByPiezaId(parseInt(pieza_id));
    res.status(200).json(revisiones);
  } catch (error: any) {
    res.status(500).json(error);
  }
};

export const getPiezasByClienteC = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const piezas = await getPiezas(parseInt(id));
    res.status(200).json(piezas);
  } catch (error: any) {
    res.status(500).json(error);
  }
};

export const getFilesByRevisionC = async (req: Request, res: Response) => {
  const { cliente_id, pieza_id, revision_id } = req.params;
  try {
    const revisiones = await getFilesByPath('clientes', `${cliente_id}/${pieza_id}/${revision_id}`);

    const images_data = revisiones?.filter((file: any) => file.metadata.mimetype.includes('image')) ?? [];
    const files_data = revisiones?.filter((file: any) => file.metadata.mimetype.includes('pdf')) ?? [];

    const images = [];

    for (const image of images_data) {
      const { signedUrl } = await getFilePublicURL(
        'clientes',
        `${cliente_id}/${pieza_id}/${revision_id}/${image.name}`
      );
      images.push({
        name: image.name,
        data: signedUrl,
        type: image.metadata.mimetype
      });
    }

    const files = [];

    for (const file of files_data) {
      const { signedUrl } = await getFilePublicURL('clientes', `${cliente_id}/${pieza_id}/${revision_id}/${file.name}`);
      files.push({
        name: file.name,
        data: signedUrl,
        type: file.metadata.mimetype
      });
    }

    res.status(200).json({ files, images });
  } catch (error: any) {
    res.status(500).json(error);
  }
};

export const updateRevisionC = async (req: Request, res: Response) => {
  const { cliente_id, pieza_id, revision_id } = req.params;
  const { archivos, imagenes } = req.body;
  try {
    console.log({ cliente_id, pieza_id, revision_id });
    await deleteFolder('clientes', `${cliente_id}/${pieza_id}/${revision_id}`);
    await uploadRevisionFiles(parseInt(cliente_id), parseInt(pieza_id), parseInt(revision_id), archivos);
    await uploadRevisionFiles(parseInt(cliente_id), parseInt(pieza_id), parseInt(revision_id), imagenes);
    res.status(200).json({});
  } catch (error: any) {
    res.status(500).json(error);
  }
};

export const createRevisionC = async (req: Request, res: Response) => {
  const { cliente_id, pieza_id } = req.params;
  const body_data = req.body;
  let { archivos, imagenes, ...revisionData } = body_data;
  try {
    const nombre = await getNextNombreRevision(parseInt(pieza_id));
    revisionData.nombre = nombre;
    const revision = await createRevision(parseInt(pieza_id), revisionData);
    if (!revision?.id) throw new Error('Error al crear la revisión');
    await uploadRevisionFiles(parseInt(cliente_id), parseInt(pieza_id), revision.id, archivos);
    await uploadRevisionFiles(parseInt(cliente_id), parseInt(pieza_id), revision.id, imagenes);

    res.status(200).json(revision);
  } catch (error: any) {
    res.status(500).json(error);
  }
};
