export type Product = {
  id: number;
  created_at: string;
  name: string;
  stock: number;
  description: string;
};

export type IndividualProduct = {
  id: number;
  created_at: string;
  code: string;
  remaining: number;
  product_id: number;
};

export type Movement = {
  id: number;
  created_at: string; // ISO date string
  product_id: number;
  individual_id: number | null;
  type: 'input' | 'output';
  consumed: number;
  order_id: number;
  generated?: boolean;
};
