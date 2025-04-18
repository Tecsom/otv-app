import { Cliente } from './clientes';

export type Pieza = {
  id: number;
  created_at: string;
  numero_parte: string;
  descripcion: string;
  cliente_id: number;
  clientes?: Cliente;
  type: string;
};

export type Revision = {
  id: number | undefined;
  created_at: string | undefined;
  pieza_id: number;
  nombre: string;
};

export type CreateRevision = {
  nombre: string;
  pieza_id: number;
};
