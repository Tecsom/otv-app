import { OrdenCompra } from '@/types/ordenes_compra';
import supabase from '@/config/supabase';
import { CreateOrderDataModel } from '@/types/ordenes_compra';
import { ApiResult } from '@/types/types';

export const getOrdenesCompra = async (): Promise<OrdenCompra[]> => {
    const { data: Ordenes, error } = await supabase().from('ordenes').select('*');
    if (error) {
        console.error('Error fetching Ordenes:', error.message);
        throw error;
    }
    return Ordenes as OrdenCompra[];
};


export const createNewOrder = async (payload: CreateOrderDataModel): Promise<ApiResult> => {
    const { data, error } = await supabase().from('ordenes').select().order('unique_folio', { ascending: false }).limit(1);

    if (error) {
        throw new Error(error.message)
    }
    const lastOrder = data[0] as OrdenCompra
    var nextUniqueFolio: number;
    nextUniqueFolio = (lastOrder?.unique_folio ?? 0) + 1

    const newOrden = {
        unique_folio: nextUniqueFolio,
        folio_id: payload.folio_id,
        client_id: payload.client_id,
        delivery_date: payload.delivery_date
    }

    const { error: uploadError } = await supabase().from('ordenes')
        .insert(newOrden)

    if (uploadError) {
        console.log({ uploadError })
        const error: ApiResult = {
            data: uploadError,
            message: uploadError.message,
            status: false
        }
        return error
    }

    const result: ApiResult = {
        data: newOrden,
        message: 'Orden creada con éxito',
        status: true
    }
    return result
}