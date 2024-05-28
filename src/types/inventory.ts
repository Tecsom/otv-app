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
