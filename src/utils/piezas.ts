import supabase from '@/config/supabase';
import type { Pieza, Revision } from '@/types/piezas';
import { deleteFile } from './storage';

export const getPiezas = async (): Promise<Pieza[]> => {
  const { data: piezas, error } = await supabase().from('piezas').select('*');
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

export const createPieza = async (pieza: Pieza): Promise<Pieza | null> => {
  const { data, error } = await supabase().from('piezas').insert(pieza).single();
  if (error) {
    console.error('Error creating pieza:', error.message);
    throw error;
  }
  return data ?? null;
};

export const updatePieza = async (id: number, pieza: Pieza): Promise<Pieza | null> => {
  const { data, error } = await supabase().from('piezas').update(pieza).eq('id', id).single();
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

export const createRevision = async (piezaId: number, revision: Revision): Promise<Revision | null> => {
  const { data, error } = await supabase()
    .from('revisiones')
    .insert({ ...revision, pieza_id: piezaId })
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
  files: File[]
): Promise<boolean> => {
  let uploaded = [];
  try {
    for (const file of files) {
      const { error } = await supabase()
        .storage.from('clientes')
        .upload(`${cliente_id}/${pieza_id}/${revision_id}/${file.name}`, file);
      if (error) {
        console.error('Error uploading file:', error.message);
        throw error;
      }
      uploaded.push(file.name);
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
