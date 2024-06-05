import { CreateCodigo, Destino, DestinoPost, Embarque, EmbarqueContenedor, EmbarqueContenedores, EmbarqueProduct, EmbarqueProductBody, OrdenesInEmbarque } from "@/types/embarques";
import supabase from "@/config/supabase";
import { ApiResult } from "@/types/types";
import { generateUid } from "./helpers";

export const listEmbarques = async () => {
    const { data: Embarques, error } = await supabase().from('embarques').select('*').order('id', { ascending: false });

    if (error) {
        console.error("Error en la consult", error)
        throw error;
    }

    return Embarques;
}

export const getEmbarqueById = async (id: number) => {
    const { data, error } = await supabase()
        .from('embarques')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error("Error fetching Embarques: ", error);
        throw error;
    }
    return data
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

    await supabase().from('destinos').delete().eq('embarque_id', embarque_id);
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

    console.log(ordenes?ordenes[0] : '')

    if (error) {
        console.error("Error fetching ordenes: ", error);
        throw error;
    }

    // Obtén los productos que ya están registrados en la tabla embarque_products
    const { data: embarqueProducts } = await supabase().from('embarque_products').select('*');

    // Filtra los productos en order_id.productos para excluir los que ya están registrados
    ordenes.forEach(orden => {
        orden.order_id.productos = orden.order_id.productos.filter((producto: any) => {
            return !embarqueProducts?.some(embarqueProduct => embarqueProduct.producto_id === producto.id);
        });
    });

    return ordenes;
}

export const createEmbarqueProduct = async (embarque_product_body: EmbarqueProductBody): Promise<ApiResult> => {

    await supabase().from('embarque_contenedores').update({
        cantidad: embarque_product_body.cantidad_filas
    }).eq('id', embarque_product_body.contenedor_id)

    const { error: uploadError, data: data } = await supabase().from('embarque_products').insert({
        embarque_id: embarque_product_body.embarque_id,
        producto_id: embarque_product_body.producto_id,
        cantidad: embarque_product_body.cantidad,
        estado: true,
        order_id: embarque_product_body.order_id,
        contenedor_id: embarque_product_body.contenedor_id
    }).select('*');

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

export const deleteProductFromEmbarque = async (contenedor_productos_id: number, contenedor_id: number, cantidad: number) => {
    
    const { data: contenedor } = await supabase().from('embarques_contenedor').select('cantidad').eq('id', contenedor_id).single()
    await supabase().from('embarque_contenedores').update({
        cantidad: cantidad
    }).eq('id', contenedor_id)

    const { error: uploadError } = await supabase().from('embarque_products').delete().eq('id', contenedor_productos_id);

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


export const createNewEmbarqueContenedor = async (embarque_data: EmbarqueContenedor, embarque_id: number): Promise<ApiResult> => {
    const codigo = generateUid();
    const { error: uploadError, data: data } = await supabase().from('embarque_contenedores').insert({
        nombre_contenedor: embarque_data.nombre_contenedor,
        codigo: codigo,
        embarque_id: embarque_id
    });

    if (uploadError) {
        console.error("Error creating new embarque: ", uploadError.message);
        const error: ApiResult = {
            data: uploadError,
            message: uploadError.message,
            status: false
        }
        return error;
    }

    const result: ApiResult = {
        data,
        message: 'Contenedor creado con éxito',
        status: true
    }

    return result;
}

export const getContenedoresByEmbarque = async (embarque_id: number) => {
    const { data: data, error: error} = await supabase().from('embarque_contenedores').select('*, embarque_id(*)').eq('embarque_id', embarque_id).order('id', {ascending: true});
    
    
    if(error) {
        console.log(error)
        throw error
    }
    
    console.log(data)
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

export const getContainersByEmbarque = async (embarque_id: number) => {

    const { data, error } = await supabase().from('embarque_contenedores').select('*').eq('embarque_id', embarque_id).order('id', {ascending: true});

    if(error) {
        console.error("Error fetching containers by embarque: ", error);
        throw error;
    }

    return data;
}

export const deleteContainerInEmbarque = async (contenedor_id: number) => {
    const { error: uploadError } = await supabase().from('embarque_contenedores').delete().eq('id', contenedor_id);

    if (uploadError) {
        console.error("Error deleting container in embarque: ", uploadError.message);
        throw uploadError;
    }

    return true;
}

export const updateContainerInEmbarque = async (contenedor_id: number, payload: EmbarqueContenedor) => {
    const { error: uploadError, data: data } = await supabase().from('embarque_contenedores').update(payload).eq('id', contenedor_id).single();

    if (uploadError) {
        console.error("Error updating container in embarque: ", uploadError.message);
        throw uploadError;
    }

    return data;
}

export const changeStateToEmbarque = async (embarque_id: number, estado: string, order_id: number) => {
    await supabase().from('ordenes').update({
        estado: 'embarque'
    }).eq('id', order_id)

    const { error: uploadError, data: data } = await supabase().from('embarques').update({ estado: estado }).eq('id', embarque_id).single();

    if (uploadError) {
        console.error("Error changing state to embarque: ", uploadError.message);
        throw uploadError;
    }

    return data;
}

export const getProductsInOrdenCompra = async (order_id: number) => {
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
    contenedor_id(*),
    created_at
    `)
    .eq('estado', true)
    .eq('order_id', order_id);

    console.log(embarque_products)

    if (error) {
        console.error("Error fetching embarque products for orden compra: ", error);
        throw error;
    }

    return embarque_products;
}

export const getDestinosPorEmbarque = async (embarque_id: number): Promise<Destino[]> => {

    const { data, error } = await supabase().from('destinos').select('*, cliente_id(*)').eq('embarque_id', embarque_id);

    if (error) {
        console.error("Error fetching clientes por embarque: ", error);
        throw error;
    }

    return data as Destino[];

}

export const postNewDestino = async (payload: DestinoPost): Promise<ApiResult> => {
    const { data, error } = await supabase().from('destinos').insert({
        ubicacion: payload.ubicacion,
        correo: payload.correo,
        telefono: payload.telefono,
        cliente_id: payload.cliente_id,
        embarque_id: payload.embarque_id
    });

    console.log(payload)

    if(error) {
        console.error("Error posting clientes por embarque: ", error);
        
        const resultError: ApiResult = {
            data: error,
            message: error.message,
            status: false
        }
        return resultError;
    }

    const result: ApiResult = {
        data: data,
        message: 'Destino creado con éxito',
        status: true
    }

    return result;
}

export const deleteDestino = async (destino_id: number): Promise<ApiResult> => {
    const { error } = await supabase().from('destinos').delete().eq('id', destino_id);

    if(error) {
        console.error("Error deleting destino: ", error);
        const resultError: ApiResult = {
            data: error,
            message: error.message,
            status: false
        }
        return resultError;
    }

    const result: ApiResult = {
        data: null,
        message: 'Destino eliminado con éxito',
        status: true
    }

    return result;
}

export const generateContenedorCode = async (payload: CreateCodigo) => {
    const { data, error } = await supabase().from('embarque_contenedor_codes').insert({
        contenedor_id: payload.contenedor_id,
        code: payload.code,
        embarque_id: payload.embarque_id
    })


    if(error) {
        console.error("Error generating code: ", error);
        throw error;
    }
    return data
}

export const getCodigosContenedores = async (embarque_id: number) => {
    const { data, error } = await supabase()
    .from('embarque_contenedor_codes')
    .select('*, contenedor_id(*, embarque_id(*))')
    .eq('embarque_id', embarque_id);

    if(error) {
        console.error("Error fetching container codes: ", error);
        throw error;
    }

    return data;
}

export const getEmbarqueData = async (embarque_id: number) => {
    const { data: embarques, error: errorEmbarque } = await supabase()
        .from('embarques')
        .select(`*`).eq('id', embarque_id).single();

    if (errorEmbarque) {
        console.error("Error fetching shipment data: ", errorEmbarque);
        throw errorEmbarque;
    }

    const { data: embarque_products, error: error_products } = await supabase().from('embarque_products').select('*, order_id(*, client_id(*)), producto_id(*, pieza_id(*))').eq('embarque_id', embarque_id).eq('estado', true);
    
    if (error_products) {
        console.error("Error fetching shipment products: ", error_products);
        throw error_products;
    }

    const { data: embarque_contenedores, error: error_contenedores } = await supabase().from('embarque_contenedores').select('*').eq('embarque_id', embarque_id);
    
    if (error_contenedores) {
        console.error("Error fetching shipment containers: ", error_contenedores);
        throw error_contenedores;
    }

    const contenedorIds = embarque_contenedores?.map(c => c.id);

    const { data: embarque_contenedor_codes, error: errorCodes } = await supabase()
        .from('embarque_contenedor_codes')
        .select('*')
        .in('contenedor_id', contenedorIds);
    
    if (errorCodes) {
        console.error("Error fetching shipment container codes: ", errorCodes);
        throw errorCodes;
    }

    const { data: embarque_contenedor_verified, error: errorContenedorVerified } = await supabase().from('embarque_contenedores_verified').select('*').eq('embarque_id', embarque_id);
    
    if (errorContenedorVerified) {
        console.error("Error fetching shipment container verified: ", errorContenedorVerified);
        throw errorContenedorVerified;
    }

    const returnData = {
        embarques, embarque_products, embarque_contenedores, embarque_contenedor_codes, embarque_contenedor_verified
    }

    return returnData;
}

export const verifyContainers = async (embarque_id: number, containers: any[]) : Promise<ApiResult> => {
    console.log(containers)
    for (const container of containers) {
            const { data, error } = await supabase().from('embarque_contenedores_verified').insert({
            embarque_id: embarque_id,
            codigo: container.codigo,
        });
        if (error) {
            console.log(error);
            throw new Error('Error verificando contenedores');
        }
    }
    const result: ApiResult = {
        data: null,
        message: 'Contenedores verificados',
        status: true
    };
    return result;
};

export const getVerificationsContainer = async (embarque_id: number) => {
    const { data, error } = await supabase().from('embarque_contenedores_verified').select('*, embarques(*, embarque_contenedores(*))').eq('embarque_id', embarque_id)

    if (error) {
        console.log(error)
        throw error;
    }

    return data
}