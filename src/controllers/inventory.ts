import supabase from '@/config/supabase';
import { IndividualProduct, Product } from '@/types/inventory';
import { QueryTable } from '@/types/types';
import { generateUid } from '@/utils/helpers';
import {
  createIndividualProduct,
  createProduct,
  deleteProduct,
  getIndividualProductsByProduct,
  getTotalIndividualsByProduct,
  updateIndividualProduct,
  updateProduct,
  upsertMovements
} from '@/utils/inventory';
import { Request, Response } from 'express';

export const getInventoryPaging = async (req: Request, res: Response) => {
  const queries = req.query as any;
  const { length, draw, search, start, page: pageStr } = queries as QueryTable;

  const page = pageStr ? parseInt(pageStr) : Math.floor(parseInt(start ?? '0') / parseInt(length ?? '10')) + 1;

  const { error, data } = await supabase().rpc('searchinventory', {
    search: search?.value ?? search ?? '',
    page,
    limitperpage: parseInt(length ?? '10')
  });

  const { error: error_totals, data: data_totals } = await supabase().rpc('searchinventory_totals', {
    search: search?.value ?? search ?? '',
    page,
    limitperpage: parseInt(length ?? '10')
  });
  console.log({ error, error_totals });
  res.status(200).json({
    draw,
    recordsTotal: data_totals[0].total_records,
    recordsFiltered: data_totals[0].total_records,
    data,
    page
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
  const description = req.body.description;
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
      const individual_prod = await createIndividualProduct(product);
      await upsertMovements([
        { product_id, individual_id: individual_prod.id, type: 'input', consumed: 0, description, generated: true }
      ]);
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

export const getIndividualProductsPaging = async (req: Request, res: Response) => {
  const queries = req.query as any;
  const { length: lengthStr, draw, search, start, page: pageStr } = queries as QueryTable;
  const product_id = parseInt(queries.product_id);
  const excluded_individuals = queries.excluded_individuals?.map((id: string) => parseInt(id)) ?? [];

  const length = parseInt(lengthStr ?? '10');
  const page = pageStr ? parseInt(pageStr) : Math.floor(parseInt(start ?? '0') / length) + 1;

  if (!product_id) return res.status(400).json({ data: [], draw, page });

  const from = page * length - length;
  const to = page * length - 1;

  const { data, error } = await supabase()
    .from('individual_products')
    .select()
    .not('id', 'in', `(${excluded_individuals.join(',')})`)
    .eq('product_id', product_id)
    .ilike('code', `%${search?.value ?? search ?? ''}%`)
    .range(from, to);

  res.status(200).json({
    draw,
    data,
    page
  });
};

export const getTotalIndividualsByProductController = async (req: Request, res: Response) => {
  const { product_id } = req.params;

  try {
    const total = await getTotalIndividualsByProduct(product_id);

    res.status(200).json(total);
  } catch (error) {
    res.status(400).json({ error: 'Error obteniendo el total' });
  }
};

export const historialMovimientos = async (req: Request, res: Response) => {
  console.log('entra');
  const queries = req.query as any;
  const { length: lengthStr, draw, start, page: pageStr } = queries as QueryTable;
  const product_id = req.params.product_id;

  const length = parseInt(lengthStr ?? '10');
  const page = pageStr ? parseInt(pageStr) : Math.floor(parseInt(start ?? '0') / length) + 1;

  const from = page * length - length;
  const to = page * length - 1;

  const { data, error } = await supabase()
    .from('movements')
    .select()
    .eq('product_id', product_id)
    .order('created_at', { ascending: false })
    .range(from, to);

  const { data: dataTotals, error: errorTotals } = await supabase()
    .from('movements')
    .select('id')
    .eq('product_id', product_id);

  res.status(200).json({
    draw,
    data,
    page,
    recordsTotal: dataTotals?.length,
    recordsFiltered: dataTotals?.length
  });
};
