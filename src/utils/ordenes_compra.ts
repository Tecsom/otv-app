import { OrdenCompra } from '@/types/ordenes_compra';
import supabase from '@/config/supabase';
import { CreateOrderDataModel } from '@/types/ordenes_compra';

export const getOrdenesCompra = async (): Promise<OrdenCompra[]> => {
    const { data: Ordenes, error } = await supabase().from('ordenes_compra').select('*');
    if (error) {
        console.error('Error fetching Ordenes:', error.message);
        throw error;
    }
    return Ordenes as OrdenCompra[];
};


export const createNewOrder = async (payload: CreateOrderDataModel): Promise<OrdenCompra> => {
    const { data: lastOrder, error } = await supabase().from('ordenes').select().order('unique_folio', { ascending: false }).limit(1);


    const data: OrdenCompra = {
        unique_folio: '',
        folio_id: payload.folio_id,
        client_id: payload.client_id,
        delivery_date: payload.delivery_date
    }
    return data
}