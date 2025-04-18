import type { OrdenCompra, ProductAdd, ProductCode, ProductOrder, productEdit } from '@/types/ordenes_compra';
import supabase from '@/config/supabase';
import type { CreateOrderDataModel } from '@/types/ordenes_compra';
import type { ApiResult } from '@/types/types';
import { deleteFolder } from './storage';
import { getPiezaById, getPiezaWithCliente, getRevisionById } from './piezas';
import { getRevisionesByPiezaC } from '@/controllers/clientes';
import {
  deleteIndividualProduct,
  deleteMovement,
  getMovementsByOrderId,
  restRemaining,
  upsertMovements
} from './inventory';
import { Pieza, Revision } from '@/types/piezas';

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
    .select('*, ordenes_static_verified(order_id, id, created_at, codigo, quantity)')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching Ordenes:', error.message);
    throw error;
  }
  console.log({ codigos_len: orden?.codigos.length });
  if (orden?.codigos.length > 0) {
    let index = 0;
    const { data: codes_verifications, error } = await supabase()
      .from('ordenes_static_verified')
      .select('*')
      .eq('order_id', id);
    if (error) throw error;
    for (const prod of orden.codigos) {
      console.log({ index });
      const is_verified = codes_verifications.filter((c: any) => c.codigo === prod.code) ?? [];
      orden.codigos[index].verified = (is_verified?.length ?? 0) > 0;
      orden.codigos[index].data = is_verified;
      // orden.codigos[index].type = is_verified
      index++;
    }
  }

  return orden;
};

export const getStaticOrderByOrderId = async (id: number) => {
  let { data: orden, error } = await supabase().from('ordenes_static').select('*').eq('order_id', id).single();

  if (error) {
    console.error('Error fetching Ordenes:', error.message);
    throw error;
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
  let consecutivo = await generate_consecutivo_folio();
  for (const product of products) {
    let product_db = productos.find((p: any) => p.id === product.id);
    console.log({ product });
    const pieza = await getPiezaWithCliente(product.piezas.id);
    const revision = await getRevisionById(product.revisiones.id);
    if (!pieza) continue;
    if (!revision) continue;
    const { codes: codigos, consecutivo: consres } = await generateProductCodeDb(
      {
        ...product,
        pieza_id: product.piezas.id,
        revision: product.revisiones.id,
        order_id: orden.id,
        type: product.piezas.type
      },
      product.quantity,
      orden,
      pieza,
      revision,
      consecutivo
    );
    consecutivo = consres;
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

  const movements = await getMovementsByOrderId(order_id);

  for (const movement of movements) {
    if (!movement.individual_id) continue;

    const remaining = await restRemaining(String(movement.individual_id), movement.consumed);
    if (remaining <= 0) {
      await deleteIndividualProduct(String(movement.individual_id));
    }
    await upsertMovements([
      {
        ...movement,
        generated: true
      }
    ]);
  }

  const result: ApiResult = {
    data: orden,
    message: 'Orden creada con éxito',
    status: true
  };
  return result;
};

const getOrderById = async (id: number): Promise<OrdenCompra> => {
  const { data: orden, error } = await supabase().from('ordenes').select('*').eq('id', id).single();

  if (error) {
    console.error('Error fetching Ordenes:', error.message);
    throw error;
  }
  return orden;
};

export const regenerateOrderCodes = async (order_id: number) => {
  const order = await getOrderById(order_id);
  const orderProducts = await getProducts(String(order.id));
  const productsCodes = await getProductsCodesForUpdate(orderProducts.map((p: any) => p.id));
  const orderStatic = await getStaticOrderByOrderId(order_id);
  const orderStaticVerified = await getOrdersStaticVerified(orderStatic.id);
  const newProductsCodes = [];
  const replaceCodes: any = [];

  for (const productCode of productsCodes) {
    const orderProduct = productCode?.order_product;
    const pieza = orderProduct.pieza;
    const revision = orderProduct.revision;
    const consecutivo = productCode.consecutivo;

    const { code_str } = generateCodesForProduct(orderProduct, 0, order, pieza, revision, consecutivo);

    replaceCodes.push({
      oldCode: productCode.code,
      newCode: code_str
    });

    newProductsCodes.push({
      id: productCode.id,
      created_at: productCode.created_at,
      product_id: productCode.product_id,
      code: code_str,
      consecutivo: consecutivo
    });
  }

  orderStatic.codigos.forEach((code: any) => {
    const replace = replaceCodes.find((c: any) => c.oldCode === code.code);

    if (replace) {
      code.code = replace.newCode;
    }
  });

  orderStatic.productos.forEach((product: any) => {
    product.codigos = product.codigos.map((code: any) => {
      const replace = replaceCodes.find((c: any) => c.oldCode === code);

      if (replace) {
        code = replace.newCode;
      }
      return code;
    });
  });

  orderStaticVerified.forEach((product: any) => {
    product.codigo = replaceCodes.find((c: any) => c.oldCode === product.codigo)?.newCode ?? product.codigo;
  });

  await upsertOrderStatic(orderStatic);
  await upsertOrderStaticVerified(orderStaticVerified);
  await upsertOrderProductsCodes(newProductsCodes);
};

const upsertOrderStatic = async (orderStatic: any) => {
  const { error } = await supabase().from('ordenes_static').upsert([orderStatic]);

  if (error) {
    console.error('Error upserting Ordenes:', error.message);
    throw error;
  }
};

const upsertOrderStaticVerified = async (orderStaticVerified: any) => {
  const { error } = await supabase().from('ordenes_static_verified').upsert(orderStaticVerified);

  if (error) {
    console.error('Error upserting Ordenes:', error.message);
    throw error;
  }
};

const upsertOrderProductsCodes = async (productsCodes: any) => {
  const { error } = await supabase().from('order_products_codes').upsert(productsCodes);

  if (error) {
    console.error('Error upserting Ordenes:', error.message);
    throw error;
  }
};

const getOrdersStaticVerified = async (orderStaticId: number) => {
  const { data, error } = await supabase().from('ordenes_static_verified').select('*').eq('order_id', orderStaticId);

  if (error) {
    console.error('Error fetching Ordenes:', error.message);
    throw error;
  }
  return data;
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

  const { data: Ordenes, error } = await supabase().rpc('search_ordenes_compra', {
    search: search ?? '',
    page,
    limitperpage: pageSize,
    estatus,
    created_at_array: createdAtFilter,
    delivery_date_array: deliveryDateFilter
  });

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
    piezas (id, numero_parte, descripcion, estado, costo_venta, costo_produccion, type),
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

export const getProductsCodesForUpdate = async (id: number[]) => {
  const { data: productos, error } = await supabase()
    .from('order_products_codes')
    .select('*,order_product:product_id(*,pieza:pieza_id(*, clientes:clientes(code_string)),revision(*))')
    .in('product_id', id);

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

const generateProductCodeDb = async (
  product: ProductCode,
  quantity: number,
  orderData: OrdenCompra,
  pieza: Pieza,
  reivision: Revision,
  consecutivo: number
): Promise<any> => {
  await deleteCodesFromProduct(product.id);
  let codes = [];

  if (product.type == 'bulk') {
    quantity = 1;
  }
  const codes_insert = [];
  for (let i = 0; i < quantity; i++) {
    consecutivo = consecutivo + 1;
    const { code_str: code, consecutivo: cons_res } = generateCodesForProduct(
      { ...product },
      i,
      orderData,
      pieza,
      reivision,
      consecutivo
    );
    if (!code) {
      console.log('No se generó código para el producto');
      continue;
    }
    codes_insert.push({ code, consecutivo: cons_res, product_id: product.id });

    codes.push(code);
  }

  const { error } = await supabase().from('order_products_codes').insert(codes_insert);

  if (error) {
    console.log(error);
    throw new Error('Error generando códigos de productos');
  }

  return { codes, consecutivo };
};

const generate_consecutivo_folio = async () => {
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

  return consecutivo?.[0]?.consecutivo ?? 0;
};

const generateCodesForProduct = (
  product: ProductCode,
  index: number,
  orderData: OrdenCompra,
  pieza: Pieza,
  revision: Revision,
  consecutivo: number
): any => {
  // const pieza = await getPiezaWithCliente(product.pieza_id);
  // const revision = await getRevisionById(product.revision);
  // let consecutivo = null;

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
      // consecutivo = await generate_consecutivo_folio(product.id);

      let cons = consecutivo + 1;

      let offset = 0;

      offset = Math.floor(consecutivo / 100000);

      cons = consecutivo - offset * 100000;

      code_str += cons?.toString()?.padStart(5, '0');
      continue;
    } else if (key === 'ano_YYYY') {
      const delivery_date = new Date(orderData?.fecha_entrega || orderData?.delivery_date || '');
      const year = delivery_date.getFullYear();

      code_str += year;

      continue;
    } else if (key === 'ano_YY') {
      const delivery_date = new Date(orderData?.fecha_entrega || orderData?.delivery_date || '');
      const year = delivery_date.getFullYear().toString().slice(-2);

      code_str += year;

      continue;
    } else if (key === 'semana_ano') {
      const delivery_date = new Date(orderData?.fecha_entrega || orderData?.delivery_date || '');
      const week = getWeekNumber(delivery_date);

      code_str += `${week.toString().padStart(2, '0')}`;

      continue;
    } else if (key === 'proveedor_id') {
      code_str += product.proveedor_id;
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
  return weekNo - 1;
}

export const verifyProds = async (order_id: number, products: any[], created_at: any, userId: number) => {
  for (const prod of products) {
    const { data, error } = await supabase().from('ordenes_static_verified').insert({
      order_id,
      codigo: prod.codigo,
      created_at,
      quantity: prod.cantidad,
      created_by: userId
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
