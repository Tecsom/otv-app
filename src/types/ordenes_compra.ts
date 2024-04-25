import { Cliente } from './clientes';
export interface CreateOrderDataModel {
  folio_id: string;
  client_id: string;
  delivery_date: string;
}

export interface OrdenCompra {
  folio_id?: string;
  client?: Cliente;
  delivery_date?: string;
  unique_folio?: number;
  id: number;
  last_update?: string;
  estado?: 'preceso' | 'pendiente' | 'completada';
}

export interface ProductAdd {
  order_id: number;
  product_id: number;
  quantity: number;
  revision: number;
  pieza_id: number;
}
export interface ProductOrder {
  id: number;
  created_at: string;
  pieza_id: number;
  quantity: number;
  order_id: number;
  revision: number;
}
export interface ProductCode {
  numero_parte: string;
  revision_name: string;
  cliente_id: number;
  id: number;
  semana_ano: string;
  ano_YYYY: string;
  order_id: number;
  ano_YY: string;
  proveedor_id: string;
  consecutivo: string;
  pieza_id: number;
  revision: number;
  created_at: string;
}

export interface productEdit {
  id: number;
  revision: number;
  cantidad: number;
}
