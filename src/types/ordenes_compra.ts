import { Cliente } from "./clientes"

export interface ordenCompra {
    folio: string
    folio_id: string
    comprador: Cliente
    delivery_date: number
}