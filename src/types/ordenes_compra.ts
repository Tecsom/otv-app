import { Cliente } from "./clientes"


export interface CreateOrderDataModel {
    folio_id: string
    client_id: string
    delivery_date: number
}

export interface OrdenCompra extends CreateOrderDataModel {
    folio: string
}
