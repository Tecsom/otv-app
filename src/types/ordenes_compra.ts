import { Cliente } from './clientes';
export interface CreateOrderDataModel {
  folio_id: string;
  client_id: string;
  delivery_date: string;
}

export interface OrdenCompra {
  folio_id: string;
  client: Cliente;
  delivery_date: string;
  unique_folio: number;
  id: number;
}

export interface ProductAdd {
  order_id: number;
  product_id: number;
  quantity: number;
  revision: number;
}
