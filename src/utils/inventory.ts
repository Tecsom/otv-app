import supabase from '@/config/supabase';
import { IndividualProduct, Product } from '@/types/inventory';

export const createProduct = async (product: Product): Promise<Product> => {
  const { data: newProduct, error } = await supabase().from('inventory').insert(product).select('*').single();

  return newProduct as Product;
};

export const getProductById = async (id: string): Promise<Product> => {
  const { data: product, error } = await supabase().from('inventory').select('*').eq('id', id).single();

  return product as Product;
};

export const updateProduct = async (product: Product): Promise<Product> => {
  const { data: updatedProduct, error } = await supabase()
    .from('inventory')
    .update(product)
    .eq('id', product.id)
    .select('*')
    .single();

  return updatedProduct as Product;
};

export const deleteProduct = async (id: string): Promise<Product> => {
  const { data: deletedProduct, error } = await supabase().from('inventory').delete().eq('id', id).select('*').single();

  return deletedProduct as Product;
};

export const createIndividualProduct = async (product: IndividualProduct): Promise<IndividualProduct> => {
  const { data: newProduct, error } = await supabase().from('individual_products').insert(product).select('*').single();

  return newProduct as IndividualProduct;
};

export const getIndividualProductById = async (id: string): Promise<IndividualProduct> => {
  const { data: product, error } = await supabase().from('individual_products').select('*').eq('id', id).single();

  return product as IndividualProduct;
};

export const updateIndividualProduct = async (product: IndividualProduct): Promise<IndividualProduct> => {
  const { data: updatedProduct, error } = await supabase()
    .from('individual_products')
    .update(product)
    .eq('id', product.id)
    .select('*')
    .single();

  return updatedProduct as IndividualProduct;
};

export const deleteIndividualProduct = async (id: string): Promise<IndividualProduct> => {
  const { data: deletedProduct, error } = await supabase()
    .from('individual_products')
    .delete()
    .eq('id', id)
    .select('*')
    .single();

  return deletedProduct as IndividualProduct;
};

export const getIndividualProductsByProduct = async (product_id: string): Promise<IndividualProduct[]> => {
  const { data: products, error } = await supabase()
    .from('individual_products')
    .select('*')
    .eq('product_id', product_id);

  return products as IndividualProduct[];
};
