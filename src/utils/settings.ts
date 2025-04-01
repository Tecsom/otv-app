import supabase from '@/config/supabase';

export const updateChekerPassword = async (newPassword: string): Promise<boolean> => {
  const { error } = await supabase().from('settings').update({ value: newPassword }).eq('name', 'checker_password');
  if (error) {
    console.error('Error fetching piezas:', error.message);
    throw error;
  }
  console.log({ error });

  return true;
};

export const getCheckerPassword = async (): Promise<string> => {
  const { data, error } = await supabase().from('settings').select(`value`).eq('name', 'checker_password');
  if (error) {
    throw new Error('Error al obtener contraseña del verificador');
  }

  return data[0]?.value;
};
