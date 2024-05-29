import { Request, Response } from 'express';
import { getClientes, createCliente, getClientById, deleteCliente, updateCliente } from './../utils/clientes';
import type { Cliente } from '@/types/clientes';
import {
  createPieza,
  createRevision,
  deletePieza,
  deleteRevision,
  getNextNombreRevision,
  getPiezas,
  getRevisionesByPiezaId,
  updatePieza,
  updateRevision,
  uploadRevisionFiles
} from '@/utils/piezas';
import { deleteFile, deleteFolder, getFilePublicURL, getFilesByPath, uploadFile } from '@/utils/storage';
import { FileUpld, QueryTable } from '@/types/types';
import supabase from '@/config/supabase';
import { Pieza } from '@/types/piezas';

export const getClientesC = async (req: Request, res: Response) => {
  try {
    const clientes = await getClientes();
    res.status(200).json(clientes);
  } catch (error: any) {
    res.status(500).json(error);
  }
};

export const getClientesPagingC = async (req: Request, res: Response) => {
  const queries = req.query as any;
  const { length, draw, search, start, page: pageStr } = queries as QueryTable;
  const page = pageStr ? parseInt(pageStr) : Math.floor(parseInt(start ?? '0') / parseInt(length ?? '10')) + 1;

  const { error, data } = await supabase().rpc('searchclientes', {
    search: search?.value ?? search ?? '',
    page,
    limitperpage: parseInt(length ?? '10')
  });

  const { error: error_totals, data: data_totals } = await supabase().rpc('searchclientes_totals', {
    search: search?.value ?? search ?? ''
  });

  res.status(200).json({
    draw,
    recordsTotal: data_totals[0].total_records,
    recordsFiltered: data_totals[0].total_records,
    data,
    page
  });
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

  const { revision_nombre } = piezaData;
  const imagenes = piezaData.imagenes;
  const archivos = piezaData.archivos;
  delete piezaData.imagenes;
  delete piezaData.archivos;
  delete piezaData.revision_nombre;

  console.log(piezaData);

  try {
    const pieza = await createPieza(piezaData);

    if (!pieza?.id) throw new Error('Error al crear la pieza');

    const revision = await createRevision(pieza?.id, {
      nombre: revision_nombre,
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

    console.log(piezaData);

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
  const { archivos, imagenes, nombre } = req.body;
  try {
    console.log(req.body);
    await updateRevision(parseInt(revision_id), nombre);
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
    console.log({ body_data });
    const revision = await createRevision(parseInt(pieza_id), revisionData);
    if (!revision?.id) throw new Error('Error al crear la revisión');
    await uploadRevisionFiles(parseInt(cliente_id), parseInt(pieza_id), revision.id, archivos);
    await uploadRevisionFiles(parseInt(cliente_id), parseInt(pieza_id), revision.id, imagenes);

    res.status(200).json(revision);
  } catch (error: any) {
    res.status(500).json(error);
  }
};

export const getPiezasTableC = async (req: Request, res: Response) => {
  const queries = req.query as any;
  const client_id = req.query.cliente_id;

  const { length, draw, search, start } = queries as QueryTable;

  const { error, data } = await supabase().rpc('searchpiezas', {
    search: search.value,
    page: parseInt(start ?? '0') / parseInt(length ?? '10') + 1,
    limitperpage: parseInt(length ?? '10'),
    client: parseInt(client_id as string)
  });
  const { error: error_totals, data: data_totals } = await supabase().rpc('searchpiezas_totals', {
    search: search.value,
    page: parseInt(start ?? '0') / parseInt(length ?? '10') + 1,
    limitperpage: parseInt(length ?? '10'),
    client: parseInt(client_id as string)
  });

  data.forEach((e: Pieza) => {
    e.type = e.type == 'bulk' ? 'A granel' : 'Individual';
  });

  res.status(200).json({
    draw,
    recordsTotal: data_totals[0].total_records,
    recordsFiltered: data_totals[0].total_records,
    data
  });
};

export const deletePiezaC = async (req: Request, res: Response) => {
  const { cliente_id, pieza_id } = req.params;
  try {
    await deleteFolder('clientes', `${cliente_id}/${pieza_id}`);
    await deletePieza(parseInt(pieza_id));
    res.status(200).json({});
  } catch (error: any) {
    res.status(500).json(error);
  }
};
export const deleteRevisionC = async (req: Request, res: Response) => {
  const { cliente_id, pieza_id, revision_id } = req.params;
  try {
    await deleteFolder('clientes', `${cliente_id}/${pieza_id}/${revision_id}`);
    await deleteRevision(parseInt(revision_id));
    await res.status(200).json({});
  } catch (error: any) {
    res.status(500).json(error);
  }
};

export const updateProfilePhotoC = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { photo }: { photo: FileUpld } = req.body;
  try {
    let file_path = `${id}/${photo.name}`;
    //force image type to png
    file_path = file_path.replace(/\.[^/.]+$/, '.png');

    await deleteFile(file_path, 'clientes');
    await uploadFile(file_path, 'clientes', photo.data, {
      contentType: 'image/png'
    });

    res.status(200).json({ message: 'Foto de perfil actualizada', status: true });
  } catch (error: any) {
    console.log({ error });
    res.status(500).json(error);
  }
};

export const getProfilePhotoC = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { signedUrl } = await getFilePublicURL('clientes', `${id}/logo.png`);
    res.status(200).json(signedUrl);
  } catch (error: any) {
    res.status(500).json(error);
  }
};
