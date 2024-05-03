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
