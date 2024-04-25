import supabase from '@/config/supabase';
import type { CreateRevision, Pieza, Revision } from '@/types/piezas';
import { deleteFile, deleteFolder, uploadFile } from './storage';
import { FileUpld } from '@/types/types';
import { generateSigRevision } from '@/helpers/misc';

export const getPiezas = async (cliente_id: number): Promise<Pieza[]> => {
  const { data: piezas, error } = await supabase().from('piezas').select('*').eq('cliente_id', cliente_id);
  if (error) {
    console.error('Error fetching piezas:', error.message);
    throw error;
  }
  return (piezas ?? []) as Pieza[];
};

export const getPiezaById = async (id: number): Promise<Pieza | null> => {
  const { data: pieza, error } = await supabase().from('piezas').select('*').eq('id', id).single();
  if (error) {
    console.error('Error fetching pieza:', error.message);
    throw error;
  }
  return pieza ?? null;
};

export const getPiezaWithCliente = async (id: number): Promise<Pieza | null> => {
  const { data: pieza, error } = await supabase()
    .from('piezas')
    .select(
      `
    *,
    clientes (id, nombre, code_string, proveedor_id)
    `
    )
    .eq('id', id)
    .single();
  if (error) {
    console.error('Error fetching pieza:', error.message);
    throw error;
  }
  return pieza ?? null;
};

export const createPieza = async (pieza: Pieza): Promise<Pieza | null> => {
  const { data, error } = await supabase().from('piezas').insert(pieza).select('*').single();
  if (error) {
    console.error('Error creating pieza:', error.message);
    throw error;
  }
  return data ?? null;
};

export const updatePieza = async (id: number, pieza: Pieza): Promise<Pieza | null> => {
  const { data, error } = await supabase().from('piezas').update(pieza).eq('id', id).select('*').single();
  if (error) {
    console.error('Error updating pieza:', error.message);
    throw error;
  }
  return data ?? null;
};

export const deletePieza = async (id: number): Promise<number> => {
  const { error } = await supabase().from('piezas').delete().eq('id', id);
  if (error) {
    console.error('Error deleting pieza:', error.message);
    throw error;
  }
  return id;
};

export const createRevision = async (
  piezaId: number | undefined,
  revision: CreateRevision
): Promise<Revision | null> => {
  const { data, error } = await supabase()
    .from('revisiones')
    .insert({ ...revision, pieza_id: piezaId })
    .select('*')
    .single();
  if (error) {
    console.error('Error creating revision:', error.message);
    throw error;
  }
  return (data ?? null) as Revision;
};

export const uploadRevisionFiles = async (
  cliente_id: number,
  pieza_id: number,
  revision_id: number,
  files: FileUpld[]
): Promise<boolean> => {
  let uploaded = [];
  try {
    for (const file of files) {
      const file_path = `${cliente_id}/${pieza_id}/${revision_id}/${file.name}`;
      await uploadFile(file_path, 'clientes', file.data, {
        contentType: file.type
      });
      uploaded.push(file_path);
    }
    return true;
  } catch (error: any) {
    console.error('Error uploading files:', error.message);
    await deleteRevisionFiles(cliente_id, pieza_id, revision_id, uploaded);

    throw error;
  }
};

export const deleteRevisionFiles = async (
  cliente_id: number,
  pieza_id: number,
  revision_id: number,
  files: string[]
): Promise<void> => {
  for (const filename of files) {
    try {
      await deleteFile(`${cliente_id}/${pieza_id}/${revision_id}/${filename}`, 'clientes');
    } catch (error: any) {
      console.error('Error deleting files:', error.message);
      throw error;
    }
  }
};

export const getRevisionesByPiezaId = async (piezaId: number): Promise<Revision[]> => {
  const { data: revisiones, error } = await supabase().from('revisiones').select('*').eq('pieza_id', piezaId);
  if (error) {
    console.error('Error fetching revisiones:', error.message);
    throw error;
  }
  return (revisiones ?? []) as Revision[];
};

export const getNextNombreRevision = async (piezaId: number): Promise<string> => {
  //get the last revision by the column created_at
  const { data: revisiones, error } = await supabase()
    .from('revisiones')
    .select('*')
    .eq('pieza_id', piezaId)
    .order('created_at', { ascending: false })
    .limit(1);
  if (error) {
    console.error('Error fetching revisiones:', error.message);
    throw error;
  }
  if (!revisiones || revisiones.length === 0) return '-';

  const lastRevision = revisiones[0];
  const lastRevisionName = lastRevision.nombre;
  const next = generateSigRevision(lastRevisionName);
  return next;
};

export const deleteRevision = async (id: number): Promise<number> => {
  const { error } = await supabase().from('revisiones').delete().eq('id', id);
  if (error) {
    console.error('Error deleting revision:', error.message);
    throw error;
  }
  return id;
};

export const getRevisionById = async (id: number): Promise<Revision | null> => {
  const { data: revision, error } = await supabase().from('revisiones').select('*').eq('id', id).single();
  if (error) {
    console.error('Error fetching revision:', error.message);
    throw error;
  }
  return revision ?? null;
};
