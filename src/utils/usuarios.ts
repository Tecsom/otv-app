import supabase from '@/config/supabase';
import { Usuario } from '@/types/usuarios';

export const getUsuarios = async (): Promise<Usuario[]> => {
  const { data, error } = await supabase().from('usuarios').select('*');
  if (error) throw error;
  return data;
};
