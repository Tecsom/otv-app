import supabase from '@/config/supabase';
import { Usuario } from '@/types/usuarios';

export const getUsuarios = async (): Promise<Usuario[]> => {
  const { data, error } = await supabase().from('usuarios').select('*');
  if (error) throw error;
  return data;
};

export const createUsuario = async (usuario: Usuario, password: string): Promise<Usuario> => {
  if (!usuario.email || !password) {
    throw new Error('Email y contraseña son requeridos');
  }

  const { error: error_user, data: user_database } = await supabase().auth.signUp({
    email: usuario.email,
    password
  });
  if (error_user) throw error_user;

  usuario.id = user_database?.user?.id as string;
  const { data, error } = await supabase().from('usuarios').insert(usuario).select('*').single();
  if (error) throw error;
  return data;
};

export const editUsuario = async (usuario: Usuario): Promise<Usuario> => {
  const { data, error } = await supabase().from('usuarios').update(usuario).eq('id', usuario.id).select('*').single();
  if (error) throw error;
  return data;
};

export const deleteUsuario = async (id: string): Promise<void> => {
  const { data, error } = await supabase().auth.admin.deleteUser(id);
  if (error) throw error;
};

export const changeUserPassword = async (id: string, password: string): Promise<void> => {
  const { error } = await supabase().auth.admin.updateUserById(id, { password });
  if (error) throw error;
  console.log('Password changed');
};

export const getUsersTable = async (
  start: number,
  length: number,
  order: { id: string; dir: string },
  filters: { search?: string }
): Promise<{
  users: Usuario[];
  recordsFiltered: number;
}> => {
  const query = supabase()
    .from('usuarios')
    .select('*')
    .range(start, start + length - 1)
    .order(order.id || 'id', { ascending: order.dir === 'asc' });

  if (filters.search) {
    query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const queryTotals = supabase().from('usuarios').select('id', { count: 'exact' });

  if (filters.search) {
    queryTotals.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
  }

  const { count, error: countError } = await queryTotals;

  if (countError) {
    throw new Error(countError.message);
  }

  return {
    users: data,
    recordsFiltered: count || 0
  };
};
