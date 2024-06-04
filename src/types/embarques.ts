export type Embarque = {
    id: number;
    descripcion: string;
    tipo_contenedor: string;
    order_products_id: number;
    created_at: string;
    fecha_entrega: string;
    fecha_embarque: string;
}


export type EmbarqueProduct = {
    id: number;
    embarque_id: number;
    product_id: number;
    cantidad: number;
    estado: boolean;
    created_at: string;
}

export type OrdenesInEmbarque = {
    id: number;
    created_at: string;
    codigo: string;
    order_id: {
        id: number;
        order_id: [];
        productos: [];
    };
    quantity: number;
}

export type EmbarqueProductBody = {
    embarque_id: number;
    producto_id: number;
    cantidad: number;
    estado: boolean;
    order_id: number;
    cantidad_filas: number;
    contenedor_id: number;
    
}

export type EmbarqueContenedor = {
    nombre_contenedor: string;
}

export type EmbarqueContenedores = {
    id: number;
    nombre_contenedor: string;
    codigo: string;
    embarque_id: number;
    created_at: string;
}

export type DestinoPost = {
    ubicacion: string;
    correo: string;
    telefono: string;
    cliente_id: number;
    embarque_id: number;
}

export type Destino = {
    id: number;
    ubicacion: string;
    correo: string;
    telefono: string;
    cliente_id: number;
    embarque_id: number;
    created_at: string;
}

export type CreateCodigo = {
    contenedor_id: number;
    code: string;
}
