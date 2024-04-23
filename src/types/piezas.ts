export type Pieza = {
  id: number;
  created_at: string;
  numero_parte: string;
  descripcion: string;
  cliente_id: number;
};

export type Revision = {
  id: number;
  created_at: string;
  pieza_id: number;
  nombre: string;
};
