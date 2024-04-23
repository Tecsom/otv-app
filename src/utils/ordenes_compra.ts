import { Cliente } from '@/types/clientes';
import supabase from '@/config/supabase';

export const getOrdenesCompra = async (): Promise<Cliente[]> => {
    const { data: clientes, error } = await supabase().from('ordenes_compra').select('*');
    if (error) {
        console.error('Error fetching clientes:', error.message);
        throw error;
    }
    return clientes as Cliente[];
};
