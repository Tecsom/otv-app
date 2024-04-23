export interface CreateOrderDataModel {
    folio_id: string
    client_id: string
    delivery_date: number
}

export interface OrdenCompra extends CreateOrderDataModel {
    unique_folio: string
}
