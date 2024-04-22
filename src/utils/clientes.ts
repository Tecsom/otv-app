import { Cliente } from '@/types/clientes';
import supabase from '@/config/supabase';

export const getClientes = async (): Promise<Cliente[]> => {
  const { data: clientes, error } = await supabase().from('clientes').select('*');
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
