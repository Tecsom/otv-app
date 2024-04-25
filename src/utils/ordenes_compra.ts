import type { OrdenCompra, ProductAdd, productEdit } from '@/types/ordenes_compra';
import supabase from '@/config/supabase';
import type { CreateOrderDataModel } from '@/types/ordenes_compra';
import type { ApiResult } from '@/types/types';
import { deleteFolder } from './storage';

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

export const updateOrder = async (payload: OrdenCompra): Promise<ApiResult> => {
  const { error: uploadError, data } = await supabase()
    .from('ordenes')
    .update({
      ...payload,
      last_update: new Date().toISOString()
    })
    .eq('id', payload.id)
    .select('*')
    .single();

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
    data,
    message: 'Orden creada con éxito',
    status: true
  };
  return result;
};

export const deleteOrder = async (id: number): Promise<ApiResult> => {
  const { error: uploadError } = await supabase().from('ordenes').delete().eq('id', id);
  await deleteFolder('ordenes_compra', `${id}`);

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
    data: null,
    message: 'Orden eliminada con éxito',
    status: true
  };
  return result;
};

export const getProducts = async (id: string) => {
  console.log({ id });
  const { data: productos, error } = await supabase()
    .from('order_products')
    .select(
      `
    id,
    created_at,
    piezas (id, numero_parte, descripcion, estado, costo_venta, costo_produccion),
    revisiones (id, nombre, descripcion),
    quantity
    `
    )
    .eq('order_id', id);

  if (error) {
    console.log(error);
    throw new Error(error.details);
  }
  return productos;
};

export const addOrderProduct = async (product: ProductAdd): Promise<boolean> => {
  const { error: uploadError } = await supabase().from('order_products').insert(product);
  if (uploadError) {
    console.log(uploadError);
    throw new Error('Ocurrio un error al subir a supabase');
  }

  return true;
};

export const removeOrderProduct = async (product_id: string): Promise<boolean> => {
  const { error: uploadError } = await supabase().from('order_products').delete().eq('id', product_id);
  if (uploadError) {
    console.log(uploadError);
    throw new Error('Error eliminando producto');
  }

  return true;
};

export const OrderProductEdit = async (payload: productEdit): Promise<boolean> => {
  const { error: uploadError, data } = await supabase()
    .from('order_products')
    .update({
      quantity: payload.cantidad,
      revision: payload.revision
    })
    .eq('id', payload.id)
    .select('*')
    .single();
  if (uploadError) {
    throw new Error('Error editando producto de orden');
  }

  return true;
};
