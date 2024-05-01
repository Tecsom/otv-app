import type { OrdenCompra, ProductAdd, ProductCode, ProductOrder, productEdit } from '@/types/ordenes_compra';
import supabase from '@/config/supabase';
import type { CreateOrderDataModel } from '@/types/ordenes_compra';
import type { ApiResult } from '@/types/types';
import { deleteFolder } from './storage';
import { getPiezaById, getPiezaWithCliente, getRevisionById } from './piezas';
import { getRevisionesByPiezaC } from '@/controllers/clientes';

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

export const getStaticOrden = async (id: number) => {
  let { data: orden, error } = await supabase()
    .from('ordenes_static')
    .select('*, ordenes_static_verified(order_id, id, created_at, codigo)')
    .eq('id', id)
    .single();
  if (error) {
    console.error('Error fetching Ordenes:', error.message);
    throw error;
  }
  if (orden?.codigos.length > 0) {
    let index = 0;
    for (const prod of orden.codigos) {
      const is_verified = await supabase()
        .from('ordenes_static_verified')
        .select('*')
        .eq('order_id', id)
        .eq('codigo', prod.code);
      orden.codigos[index].verified = (is_verified?.data?.length ?? 0) > 0;
      index++;
    }
  }

  return orden;
};

export const getOrdenByCodeProd = async (code: string) => {
  const { data: orden, error } = await supabase().rpc('buscar_orden_por_codigo', { codigo_busqueda: code });
  if (error) {
    console.error('Error fetching Ordenes:', error.message);
    throw error;
  }
  return orden;
};

export const generarOrdenDeCompraEstatica = async (order_data: any) => {
  const { order_id, ...static_data } = order_data;
  const productos = order_data.productos;

  const { data: orden, error } = await supabase()
    .from('ordenes_static')
    .insert({
      ...static_data,
      order_id
    })
    .select('*')
    .single();

  if (error) {
    console.error('Error fetching Ordenes:', error.message);
    throw error;
  }
  //!aqui generar códigos
  // { code, numero_parte, verified }
  const products = await getProducts(order_id);
  let products_codes = [];
  const full_codigos = [];
  for (const product of products) {
    let product_db = productos.find((p: any) => p.id === product.id);

    const codigos = await generateProductCodeDb(
      {
        ...product,
        pieza_id: product.piezas.id,
        revision: product.revisiones.id,
        order_id: orden.id
      },
      product.quantity
    );
    product_db.codigos = codigos;
    products_codes.push(product_db);
    full_codigos.push(
      ...(codigos.map((c: any) => ({
        code: c,
        verified: false,
        numero_parte: product.piezas.numero_parte
      })) ?? [])
    );
  }

  await updateOrder({ id: order_id, unique_folio: orden.folio_unico, estado: 'proceso' });

  const { error: error_upd } = await supabase()
    .from('ordenes_static')
    .update({ productos: products_codes, codigos: full_codigos })
    .eq('id', orden.id);

  if (error_upd) {
    console.error('Error updating order:', error_upd.message);
    throw error_upd;
  }

  const result: ApiResult = {
    data: orden,
    message: 'Orden creada con éxito',
    status: true
  };
  return result;
};

export const getOrdenesCompraPaging = async (
  page: number,
  pageSize: number,
  search: string | null,
  estatus: string[],
  createdAtFilter: any[],
  deliveryDateFilter: any[]
) => {
  search = search?.trim() === '' ? null : search;
  console.log({ search });
  const { data: Ordenes, error } = await supabase().rpc('search_ordenes_compra', {
    search: search ?? '',
    page,
    limitperpage: pageSize,
    estatus,
    created_at_array: createdAtFilter,
    delivery_date_array: deliveryDateFilter
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
    delivery_date: payload.delivery_date,
    usuario_creador: payload.usuario_creador
  };

  const { error: uploadError, data } = await supabase().from('ordenes').insert(newOrden).select('*').single();

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
  let productos: any = [];
  const { data: productos_res, error } = await supabase()
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

  for (const product of productos_res) {
    const codes = await getProductsCodes(product.id);
    productos.push({ ...product, codes });
  }

  return productos;
};

export const getProductsCodes = async (id: number) => {
  const { data: productos, error } = await supabase().from('order_products_codes').select('*').eq('product_id', id);

  if (error) {
    console.log(error);
    throw new Error(error.details);
  }
  return productos;
};

export const addOrderProduct = async (product: ProductAdd): Promise<boolean> => {
  const { error: uploadError, data } = await supabase().from('order_products').insert(product).select('*').single();

  if (uploadError) {
    console.log(uploadError);
    throw new Error('Ocurrio un error al subir a supabase');
  }

  await updateOrder({ id: data.order_id, last_update: new Date().toISOString() });

  return true;
};

export const removeOrderProduct = async (product_id: string): Promise<boolean> => {
  const order_data = (await supabase().from('order_products').select('*').eq('id', product_id).single()).data;
  const { error: uploadError } = await supabase().from('order_products').delete().eq('id', product_id);
  if (uploadError) {
    console.log(uploadError);
    throw new Error('Error eliminando producto');
  }
  console.log({ order_data });

  await updateOrder({ id: order_data.order_id, last_update: new Date().toISOString() });
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

  await updateOrder({ id: data.order_id, last_update: new Date().toISOString() });

  return true;
};

const deleteCodesFromProduct = async (product_id: number): Promise<boolean> => {
  const { error } = await supabase().from('order_products_codes').delete().eq('product_id', product_id);

  if (error) {
    console.log(error);
    throw new Error('Error eliminando códigos de producto');
  }

  return true;
};

const generateProductCodeDb = async (product: ProductCode, quantity: number): Promise<any> => {
  await deleteCodesFromProduct(product.id);
  let codes = [];
  for (let i = 0; i < quantity; i++) {
    const { code_str: code, consecutivo } = await generateCodesForProduct({ ...product }, i);
    if (!code) {
      console.log('No se generó código para el producto');
      continue;
    }
    const { error } = await supabase()
      .from('order_products_codes')
      .insert({ code, product_id: product.id, consecutivo });

    codes.push(code);

    if (error) {
      console.log(error);
      throw new Error('Error generando códigos de productos');
    }
  }

  return codes;
};

const generate_consecutivo_folio = async (producto_id: number) => {
  //get biggest consecutivo
  const { data: consecutivo, error } = await supabase()
    .from('order_products_codes')
    .select('consecutivo')
    .order('consecutivo', { ascending: false })
    .limit(1);

  if (error) {
    console.log(error);
    throw new Error('Error generando consecutivo de producto');
  }

  return (consecutivo?.[0]?.consecutivo ?? 0) + 1;
};

const generateCodesForProduct = async (product: ProductCode, index: number): Promise<any> => {
  const pieza = await getPiezaWithCliente(product.pieza_id);
  const revision = await getRevisionById(product.revision);
  let consecutivo = null;

  product.numero_parte = pieza?.numero_parte ?? '';
  product.revision_name = revision?.nombre ?? '';
  product.proveedor_id = pieza?.clientes?.proveedor_id ?? '';
  product.cliente_id = pieza?.clientes?.id ?? 0;
  product.id = product.order_id;

  if (!pieza?.clientes?.code_string) return '';

  const { code_string } = pieza?.clientes;
  const code = JSON.parse(code_string ?? '[]');

  let code_str = '';

  for (const { id: key, value } of code) {
    const key_obj = code_map.find(c => c.value === value)?.key;
    if (key === 'consecutivo') {
      consecutivo = await generate_consecutivo_folio(product.id);

      let cons = consecutivo;

      let offset = 0;

      offset = Math.floor(consecutivo / 100000);

      cons = consecutivo - offset * 100000;

      code_str += cons?.toString()?.padStart(4, '0');
      continue;
    } else if (key === 'ano_YYYY') {
      const delivery_date = new Date(product.created_at);
      const year = delivery_date.getFullYear();

      code_str += year;

      continue;
    } else if (key === 'ano_YY') {
      const delivery_date = new Date(product.created_at);
      const year = delivery_date.getFullYear().toString().slice(-2);

      code_str += year;

      continue;
    } else if (key === 'semana_ano') {
      const delivery_date = new Date(product.created_at);
      const week = getWeekNumber(delivery_date);

      code_str += `${week.toString().padStart(2, '0')}`;

      continue;
    }
    if (!key_obj) {
      code_str += value;
      continue;
    }

    code_str += product[key_obj as keyof ProductCode] ?? '';
  }

  return {
    code_str,
    consecutivo
  };
};

const code_map = [
  { value: 'Número de parte', id: 'numero_parte', key: 'numero_parte' },
  { value: 'Revisión de parte', id: 'revision_parte', key: 'revision_name' },
  { value: 'ID de cliente', id: 'cliente_id', key: 'client_id' },
  { value: 'ID orden de compra', id: 'orden_compra_id', key: 'id' },
  { value: 'Semana del año (Fecha de entrega - WW)', id: 'semana_ano', key: 'semana_ano' },
  { value: 'Año (Fecha de entrega - YYYY)', id: 'ano_YYYY', key: 'ano_4y' },
  { value: 'Año (Fecha de entrega - YY)', id: 'ano_YY', key: 'ano_2y' },
  { value: 'Identificador de proveedor', id: 'proveedor_id', key: 'proveedor_id' },
  { value: '# Consecutivo de la pieza por OC', id: 'consecutivo', key: 'consecutivo' }
];

function getWeekNumber(d: any): number {
  // Copy date so don't modify original
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  // Get first day of year
  const yearStart: any = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  // Calculate full weeks to nearest Thursday
  const weekNo: number = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  // Return array of year and week number
  return weekNo;
}

export const verifyProds = async (order_id: number, products: any[]) => {
  const created_at = new Date().toISOString();
  for (const prod of products) {
    const { data, error } = await supabase().from('ordenes_static_verified').insert({
      order_id,
      codigo: prod.codigo,
      created_at
    });
    if (error) {
      console.log(error);
      throw new Error('Error verificando productos');
    }
  }

  const result: ApiResult = {
    data: null,
    message: 'Productos verificados',
    status: true
  };

  return result;
};

const checkIfVerified = async (order_id: number, code: string): Promise<boolean> => {
  const { data, error } = await supabase()
    .from('ordenes_static_verified')
    .select('*')
    .eq('order_id', order_id)
    .eq('codigo', code);

  if (error) {
    console.log(error);
    throw new Error('Error verificando productos');
  }

  return data.length > 0;
};

export const getStaticOrderProducts = async (order_id: number) => {
  const { data, error } = await supabase().from('order_products').select('*').eq('order_id', order_id);

  if (error) {
    console.log(error);
    throw new Error('Error obteniendo productos de orden');
  }

  return data;
};
