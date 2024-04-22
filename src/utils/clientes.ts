import { Cliente } from '@/types/clientes';
import supabase from '@/config/supabase';

export const getClientes = async (): Promise<Cliente[]> => {
  const { data: clientes, error } = await supabase().from('clientes').select('*');
  if (error) throw new Error(error.message);
  return clientes as Cliente[];
};
