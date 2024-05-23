export type Embarque = {
    id: number;
    descripcion: string;
    tipo_contenedor: string;
    order_products_id: number;
    created_at: string;
}


export type EmbarqueProduct = {
    id: number;
    embarque_id: number;
    product_id: number;
    cantidad: number;
    estado: boolean;
    created_at: string;
}