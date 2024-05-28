import supabase from '@/config/supabase';
import { IndividualProduct, Product } from '@/types/inventory';
import { QueryTable } from '@/types/types';
import {
  createIndividualProduct,
  createProduct,
  deleteProduct,
  getIndividualProductsByProduct,
  updateIndividualProduct,
  updateProduct
} from '@/utils/inventory';
import { Request, Response } from 'express';

export const getInventoryPaging = async (req: Request, res: Response) => {
  const queries = req.query as any;
  const { length, draw, search, start } = queries as QueryTable;

  const { error, data } = await supabase().rpc('searchinventory', {
    search: search?.value ?? search ?? '',
    page: parseInt(start ?? '0') / parseInt(length ?? '10') + 1,
    limitperpage: parseInt(length ?? '10')
  });

  const { error: error_totals, data: data_totals } = await supabase().rpc('searchinventory_totals', {
    search: search?.value ?? search ?? '',
    page: parseInt(start ?? '0') / parseInt(length ?? '10') + 1,
    limitperpage: parseInt(length ?? '10')
  });
  console.log({ data });
  res.status(200).json({
    draw,
    recordsTotal: data_totals[0].total_records,
    recordsFiltered: data_totals[0].total_records,
    data
  });
};

export const createProductController = async (req: Request, res: Response) => {
  const product_data = req.body as Product;

  try {
    const newProduct = await createProduct(product_data);

    res.status(200).json(newProduct);
  } catch (error) {
    res.status(400).json({ error: 'Error creando el producto' });
  }
};

export const updateProductController = async (req: Request, res: Response) => {
  const product_data = req.body as Product;

  try {
    const updatedProduct = await updateProduct(product_data);

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(400).json({ error: 'Error actualizando el producto' });
  }
};

export const deleteProductController = async (req: Request, res: Response) => {
  const { product_id } = req.params;

  try {
    const deletedProduct = await deleteProduct(product_id);

    res.status(200).json(deletedProduct);
  } catch (error) {
    res.status(400).json({ error: 'Error eliminando el producto' });
  }
};

export const createIndividualProductController = async (req: Request, res: Response) => {
  const quantity = req.body.quantity;
  const product_id = parseInt(req.params.product_id);

  if (!quantity) return res.status(400).json({ error: 'Falta la cantidad' });
  console.log(quantity);
  try {
    for (let i = 0; i < quantity; i++) {
      const code = generateUid();
      const product = {
        code,
        product_id
      } as IndividualProduct;
      await createIndividualProduct(product);
    }

    res.status(200).json({});
  } catch (error) {
    res.status(400).json({ error: 'Error creando el producto' });
  }
};
export const getIndividualProductsByProductIdController = async (req: Request, res: Response) => {
  const { product_id } = req.params;

  try {
    const individual_products = await getIndividualProductsByProduct(product_id);

    return res.status(200).json(individual_products);
  } catch (error) {
    return res.status(400).json({ error: 'Error obteniendo los productos' });
  }
};

export const updateIndividualProductController = async (req: Request, res: Response) => {
  const product_data = req.body as IndividualProduct;

  try {
    const updatedProduct = await updateIndividualProduct(product_data);

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(400).json({ error: 'Error actualizando el producto' });
  }
};

//function generates uid 7chars from 0-1 AZ az
const generateUid = () => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  const length = 7;
  for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};
