import { OrdenCompra } from '@/types/ordenes_compra';
import supabase from '@/config/supabase';
import { CreateOrderDataModel } from '@/types/ordenes_compra';

export const getOrdenesCompra = async (): Promise<OrdenCompra[]> => {
    const { data: clientes, error } = await supabase().from('ordenes_compra').select('*');
    if (error) {
        console.error('Error fetching clientes:', error.message);
        throw error;
    }
    return clientes as OrdenCompra[];
};


export const createNewOrder = async (payload: CreateOrderDataModel): Promise<boolean> => {
    console.log(payload)
    return true
}