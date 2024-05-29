import supabase from '@/config/supabase';
import { IndividualProduct, Movement, Product } from '@/types/inventory';

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
  //set deleted column to true
  const { data: deletedProduct, error } = await supabase()
    .from('inventory')
    .update({ deleted: true })
    .eq('id', id)
    .select('*')
    .single();

  await deleteIndividualsByProduct(id);

  return deletedProduct as Product;
};

export const deleteIndividualsByProduct = async (product_id: string): Promise<IndividualProduct[]> => {
  const { data: deletedProducts, error } = await supabase()
    .from('individual_products')
    .update({ deleted: true })
    .eq('product_id', product_id)
    .select('*');

  return deletedProducts as IndividualProduct[];
};

export const createIndividualProduct = async (product: IndividualProduct): Promise<IndividualProduct> => {
  const { data: newProduct, error } = await supabase().from('individual_products').insert(product).select('*').single();

  return newProduct as IndividualProduct;
};

export const getIndividualProductById = async (id: string): Promise<IndividualProduct> => {
  const { data: product, error } = await supabase().from('individual_products').select('*').eq('id', id).single();

  return product as IndividualProduct;
};

export const getTotalIndividualsByProduct = async (product_id: string): Promise<number> => {
  const { data: products, error } = await supabase()
    .from('individual_products')
    .select('*')
    .eq('product_id', product_id)
    .eq('deleted', false);

  if (error) {
    throw error;
  }

  return products.length;
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
  //edit column deleted to true
  const { data: deletedProduct, error } = await supabase()
    .from('individual_products')
    .update({ deleted: true })
    .eq('id', id)
    .select('*')
    .single();

  return deletedProduct as IndividualProduct;
};

export const getIndividualProductsByProduct = async (product_id: string): Promise<IndividualProduct[]> => {
  const { data: products, error } = await supabase()
    .from('individual_products')
    .select('*')
    .eq('product_id', product_id)
    .eq('deleted', false);

  return products as IndividualProduct[];
};

export const upsertMovements = async (movements: Movement[]): Promise<Movement[]> => {
  const { data, error } = await supabase()
    .from('movements')
    .upsert(movements, { onConflict: 'id' })
    .select('*, product:product_id(*), individual:individual_id(*)');

  if (error) {
    throw error;
  }

  if (!data) {
    return [];
  }

  return data as Movement[];
};

export const getMovementsByIndividual = async (product_id: string): Promise<Movement[]> => {
  const { data: movements, error } = await supabase()
    .from('movements')
    .select('*, product:product_id(*), individual:individual_id(*)')
    .eq('individual_id', product_id);

  if (error) {
    throw error;
  }

  return movements as Movement[];
};

export const deleteMovement = async (id: string): Promise<Movement> => {
  const { data: deletedMovement, error } = await supabase()
    .from('movements')
    .delete()
    .eq('id', id)
    .select('*')
    .single();

  return deletedMovement as Movement;
};

export const restRemaining = async (individual_id: string, consumed: number): Promise<number> => {
  const individual_product = await getIndividualProductById(individual_id);
  const updated_individual_product = await updateIndividualProduct({
    ...individual_product,
    remaining: individual_product.remaining - consumed
  });

  return individual_product.remaining - consumed;
};

export const getMovementsByOrderId = async (order_id: string): Promise<Movement[]> => {
  const { data: movements, error } = await supabase().from('movements').select('*').eq('order_id', order_id);

  if (error) {
    throw error;
  }

  return movements as Movement[];
};

export const checkProductStock = async (individual_id: string, consumed: number): Promise<boolean> => {
  const individual_product = await getIndividualProductById(individual_id);
  const remaining_individual = individual_product.remaining;
  const ungenerated = await getUngeneratedOutputMovements(individual_id);

  const ungenerated_consumed = ungenerated.reduce((acc, movement) => acc + movement.consumed, 0);
  const rem = remaining_individual - consumed - ungenerated_consumed;

  if (remaining_individual - consumed - ungenerated_consumed < 0) {
    throw new Error('No hay suficiente stock');
  }

  return remaining_individual - consumed - ungenerated_consumed >= 0;
};

export const getRemaining = async (individual_id: string): Promise<number> => {
  const individual_product = await getIndividualProductById(individual_id);

  return individual_product.remaining;
};

export const getUngeneratedOutputMovements = async (individual_id: string): Promise<Movement[]> => {
  const { data: movements, error } = await supabase()
    .from('movements')
    .select('*')
    .eq('individual_id', individual_id)
    .eq('type', 'output')
    .eq('generated', false);

  if (error) {
    throw error;
  }

  return movements as Movement[];
};

export const hasUngeneratedOutputMovements = async (individual_id: string): Promise<boolean> => {
  const movements = await getUngeneratedOutputMovements(individual_id);

  return movements.length > 0;
};
