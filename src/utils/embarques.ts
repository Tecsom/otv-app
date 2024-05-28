import { Embarque, EmbarqueContenedor, EmbarqueContenedores, EmbarqueProduct, EmbarqueProductBody, OrdenesInEmbarque } from "@/types/embarques";
import supabase from "@/config/supabase";
import { ApiResult } from "@/types/types";

export const listEmbarques = async () => {
    const { data: Embarques, error } = await supabase().from('embarques').select('*').order('id', { ascending: false });

    if (error) {
        console.error("Error en la consult", error)
        throw error;
    }

    return Embarques;
}

export const getEmbarqueById = async (id: number) => {
    const { data: Embarque, error } = await supabase()
        .from('embarques')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error("Error fetching Embarques: ", error);
        throw error;
    }
    return Embarque
}

export const newEmbarque = async (embarque_data: Embarque): Promise<ApiResult> => {

    console.log(embarque_data)

    const newEmbarque = {
        descripcion: embarque_data.descripcion,
        tipo_contenedor: embarque_data.tipo_contenedor,
        fecha_entrega: embarque_data.fecha_entrega,
        fecha_embarque: embarque_data.fecha_embarque
    }

    const { error: uploadError, data: data } = await supabase()
        .from('embarques')
        .insert(newEmbarque)
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
        message: 'Embarque creado con éxito',
        status: true
    };
    return result;
}

export const updtEmbarque = async (payload: Embarque, embarque_id: number): Promise<ApiResult> => {

    const { error: uploadError, data: data } = await supabase()
        .from('embarques')
        .update({ ...payload, last_update: new Date().toISOString() })
        .eq('id', embarque_id)
        .single();

    if (uploadError) {
        console.error("Error updating embarque: ", uploadError.message)
        const error: ApiResult = {
            data: uploadError,
            message: uploadError.message,
            status: false
        };
        return error;
    }
    const result: ApiResult = {
        data,
        message: 'Embarque actualizado con éxito',
        status: true
    };
    return result;
}

export const delEmbarque = async (embarque_id: number): Promise<ApiResult> => {

    const { error: error } = await supabase().from('embarque_products').delete().eq('embarque_id', embarque_id);
    await supabase().from('embarque_contenedores').delete().eq('embarque_id', embarque_id);
    const { error: uploadError } = await supabase().from('embarques').delete().eq('id', embarque_id);

    if (uploadError) {
        console.error("Error deleting embarque: ", uploadError.message)
        const error: ApiResult = {
            data: uploadError,
            message: uploadError.message,
            status: false
        }
        return error
    }

    const result: ApiResult = {
        data: null,
        message: "Embarque eliminado con éxito",
        status: true
    }
    return result;

}

export const getOrdenesStatic = async (): Promise<OrdenesInEmbarque[]> => {
    const { data: ordenes, error } = await supabase().from('group_ordenes_static_verified').select('*, order_id(id, productos, order_id(*))');

    if (error) {
        console.error("Error fetching ordenes: ", error);
        throw error;
    }
    return ordenes;
}

export const createEmbarqueProduct = async (embarque_product_body: EmbarqueProductBody): Promise<ApiResult> => {

    const { error: uploadError, data: data } = await supabase().from('embarque_products').insert(embarque_product_body).select('*');

    console.log(data)

    if (uploadError) {
        console.error("Error creating embarque product: ", uploadError.message);

        const error: ApiResult = {
            data: uploadError,
            message: uploadError.message,
            status: false
        }
        return error;
    }

    const result: ApiResult = {
        data: data,
        message: 'Producto/s agregado al embarque con éxito',
        status: true
    }
    return result;
}

export const uploadEmbarqueProducts = async (embarque_id: number, products: EmbarqueProduct[]) => {
    const { error: uploadError, data: data } = await supabase().from('embarque_products').update({ ...products, last_update: new Date().toISOString() }).eq('embarque_id', embarque_id).single();

    if (uploadError) {
        console.error("Error uploading embarque products: ", uploadError.message);
        
        const error: ApiResult = {
            data: uploadError,
            message: uploadError.message,
            status: false
        }
        return error;
    }

    const result: ApiResult = {
        data,
        message: 'Productos agregados al embarque con éxito',
        status: true
    }
    return result;
}

export const deleteEmbarqueProduct = async (embarque_product_id: number) => {
    const { error: uploadError } = await supabase().from('embarque_products').update({ estado: false }).eq('id', embarque_product_id);

    if (uploadError) {
        console.error("Error deleting embarque product: ", uploadError.message);
        const error: ApiResult = {
            data: uploadError,
            message: uploadError.message,
            status: false
        }
        return error;
    }

    const result: ApiResult = {
        data: null,
        message: 'Producto eliminado del embarque con éxito',
        status: true
    }
    return result;
}

export const deleteProductFromEmbarque = async (embarque_id: number, producto_id: number, order_id: number) => {

    
    const { error: uploadError } = await supabase().from('embarque_products').delete().eq('embarque_id', embarque_id).eq('producto_id', producto_id).eq('order_id', order_id);

    if (uploadError) {
        console.error("Error deleting embarque product: ", uploadError.message);
        const error: ApiResult = {
            data: uploadError,
            message: uploadError.message,
            status: false
        }
        return error;
    }

    const result: ApiResult = {
        data: null,
        message: 'Producto eliminado del embarque con éxito',
        status: true
    }
    return result;
}

export const createNewEmbarqueContenedor = async (embarque_data: EmbarqueContenedor) => {
    const { error: uploadError, data: data } = await supabase().from('embarque_contenedores').insert(embarque_data).select('*');

    if (uploadError) {
        console.error("Error creating new embarque: ", uploadError.message);
        throw uploadError;
    }

    return data;
}

export const getContenedoresByEmbarque = async (embarque_id: number): Promise<EmbarqueContenedores[]> => {
    const { data: data, error: error} = await supabase().from('embarque_contenedores').select('*, embarque_id(*)').eq('embarque_id', embarque_id)

    if(error) {
        console.log(error)
        throw error
    }

    return data
}

export const getEmbarqueProducts = async (embarque_id: number) => {
    const { data: embarque_products, error } = await supabase()
    .from('embarque_products')
    .select(`
    id, 
    embarque_id, 
    producto_id,
    order_products(pieza_id, piezas(id, numero_parte, descripcion, costo_venta, costo_produccion, cliente_id(id, nombre, identificador, domicilio, pais, estado, ciudad, correo, celular, currency))),
    cantidad,
    order_id,
    last_update,
    contenedor_id(*)
    `)
    .eq('embarque_id', embarque_id)
    .eq('estado', true);

    if (error) {
        console.error("Error fetching embarque products: ", error);
        throw error;
    }

    return embarque_products;
}

export const changeStateToEmbarque = async (embarque_id: number, estado: string) => {
    const { error: uploadError, data: data } = await supabase().from('embarques').update({ estado: estado }).eq('id', embarque_id).single();

    if (uploadError) {
        console.error("Error changing state to embarque: ", uploadError.message);
        throw uploadError;
    }

    return data;
}