import type { OrdenCompra, ProductAdd } from '@/types/ordenes_compra';
import supabase from '@/config/supabase';
import type { CreateOrderDataModel } from '@/types/ordenes_compra';
import type { ApiResult } from '@/types/types';

/**
 * 
folio_id: string
    client: Cliente
    delivery_date: string
    unique_folio: number
 */

export const getOrdenesCompra = async () => {
  const { data: Ordenes, error } = await supabase().from('ordenes').select(`
    folio_id,
    clientes (id, nombre),
    delivery_date,
    unique_folio,
    id,
    created_at
    `);
  if (error) {
    console.error('Error fetching Ordenes:', error.message);
    throw error;
  }
  return Ordenes;
};

export const getOrdenesCompraPaging = async (page: number, pageSize: number, search: string | null) => {
  const { data: Ordenes, error } = await supabase().rpc('search_ordenes_compra', {
    search: search ?? '',
    page,
    limitperpage: pageSize
  });
  console.log({ Ordenes, error });

  if (error) {
    console.error('Error fetching Ordenes:', error.message);
    throw error;
  }
  return Ordenes;
};

export const createNewOrder = async (payload: CreateOrderDataModel): Promise<ApiResult> => {
  const newOrden = {
    unique_folio: null,
    folio_id: payload.folio_id,
    client_id: payload.client_id,
    delivery_date: payload.delivery_date
  };

  const { error: uploadError } = await supabase().from('ordenes').insert(newOrden);

  if (uploadError) {
    console.log({ uploadError });
    const error: ApiResult = {
      data: uploadError,
      message: uploadError.message,
      status: false
    };
    return error;
  }

  const result: ApiResult = {
    data: newOrden,
    message: 'Orden creada con éxito',
    status: true
  };
  return result;
};

export const addOrderProduct = async (product: ProductAdd): Promise<boolean> => {
  const { error: uploadError } = await supabase().from('order_priducts').insert(product);

  return true;
};
