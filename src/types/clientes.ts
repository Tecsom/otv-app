export type Cliente = {
  id: number | null;
  created_at: string;
  nombre: string;
  identificador: string;
  domicilio: string;
  pais: string;
  estado: string;
  ciudad: string;
  correo: string;
  telefono: string;
  celular: string;
  code_string: any;
  code_type: string;
  proveedor_id: string;
  deleted?: boolean;
};
