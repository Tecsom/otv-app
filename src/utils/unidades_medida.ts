import supabase from '@/config/supabase';
import { UnidadMedida } from '../types/unidades_medida';

export const getUnidadesMedida = async (): Promise<UnidadMedida[]> => {
    const { data: unidades_medida, error } = await supabase().from('unidades_medida').select('*');
    if (error) {
        console.error('Error fetching unidades_medida:', error.message);
        throw error;
    }
    return unidades_medida as UnidadMedida[];
};


export const createMedida = async (medida: UnidadMedida): Promise<UnidadMedida> => {

    const { data, error } = await supabase().from('unidades_medida').insert(medida).single();
    if (error) {
        console.error('Error creating medida:', error.message);
        throw error;
    }

    return data as UnidadMedida;
}

// export const createCliente = async (cliente: Cliente): Promise<Cliente> => {
//     const { data, error } = await supabase().from('clientes').insert(cliente).single();
//     if (error) {
//         console.error('Error creating cliente:', error.message);
//         throw error;
//     }

//     return data as Cliente;
// };
