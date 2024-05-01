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
