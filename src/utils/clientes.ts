import { Cliente } from '@/types/clientes';
import supabase from '@/config/supabase';
import { deleteFolder } from './storage';

export const getClientes = async (): Promise<Cliente[]> => {
  const { data: clientes, error } = await supabase().from('clientes').select(`
  id,
  created_at,
  nombre,
  identificador,
  domicilio,
  pais, 
  estado,
  ciudad,
  correo,
  telefono,
  celular
  `);
  if (error) {
    console.error('Error fetching clientes:', error.message);
    throw error;
  }
  return clientes as Cliente[];
};

export const createCliente = async (cliente: Cliente): Promise<Cliente> => {
  const { data, error } = await supabase().from('clientes').insert(cliente).single();
  if (error) {
    console.error('Error creating cliente:', error.message);
    throw error;
  }

  return data as Cliente;
};

export const getClientById = async (id_string: string): Promise<Cliente> => {
  if (!id_string) {
    throw new Error('El id es requerido');
  }
  const id = parseInt(id_string);
  const { data, error } = await supabase().from('clientes').select('*').eq('id', id).single();
  if (error) {
    console.error('Error fetching cliente:', error.message);
    throw error;
  }

  return data as Cliente;
};

export const deleteCliente = async (id_string: string): Promise<Cliente> => {
  if (!id_string) {
    throw new Error('El id es requerido');
  }

  const id = parseInt(id_string);
  const { data, error } = await supabase().from('clientes').delete().eq('id', id).single();
  if (error) {
    console.error('Error deleting cliente:', error.message);
    throw error;
  }

  await deleteFolder('clientes', id_string);

  return data as Cliente;
};

export const updateCliente = async (cliente: Cliente, id_string: string): Promise<Cliente> => {
  if (!id_string) {
    throw new Error('El id es requerido');
  }
  const id = parseInt(id_string);
  const { data, error } = await supabase().from('clientes').update(cliente).eq('id', id).select('*').single();
  if (error) {
    console.error('Error updating cliente:', error.message);
    throw error;
  }

  return data as Cliente;
};

export const getHistorialOrdenes = async (cliente_id: number, page: number, length: number) => {
  const init = page * length;
  const end = init + length - 1;
  console.log(init, end);
  const { data, error } = await supabase()
    .from('ordenes')
    .select('*, client_id(*)')
    .eq('client_id', cliente_id)
    .order('id', { ascending: false })
    .range(init, end);

  if (error) {
    console.log(error);
    throw error;
  }

  return data;
};

export const gettHistorialEmbarques = async (cliente_id: number, page: number, length: number) => {
  const { data, error } = await supabase()
    .from('destinos')
    .select('*, embarque_id(*)')
    .eq('cliente_id', cliente_id)
    .order('id', { ascending: false })
    .range(page * length, (page + 1) * length - 1);

  if (error) {
    console.log(error);
    throw error;
  }

  return data;
};
