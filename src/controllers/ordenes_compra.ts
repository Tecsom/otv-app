import { deleteFolder, getFilePublicURL, getFilesByPath, uploadFile } from './../utils/storage';
import { Request, Response } from 'express';
import {
  getOrdenesCompra,
  createNewOrder,
  addOrderProduct,
  getOrdenesCompraPaging,
  getProducts
} from './../utils/ordenes_compra';
import type { CreateOrderDataModel, ProductAdd } from '@/types/ordenes_compra';

export const getOrdenes = async (req: Request, res: Response) => {
  try {
    const ordenes = await getOrdenesCompra();
    res.status(200).json(ordenes);
  } catch (error: any) {
    res.status(500).json(error);
  }
};

export const getOrdenesPagingC = async (req: Request, res: Response) => {
  try {
    const { page, pageSize, search } = req.query;
    const ordenes = await getOrdenesCompraPaging(
      parseInt(page as string),
      parseInt(pageSize as string),
      search as string
    );
    res.status(200).json(ordenes);
  } catch (error: any) {
    res.status(500).json(error);
  }
};
export const newOrder = async (req: Request, res: Response) => {
  const payload: CreateOrderDataModel = req.body;

  try {
    const createResult = await createNewOrder(payload);

    res.status(200).json(createResult);
  } catch (e) {
    res.status(500).json(e);
  }
};

export const addProductToOrder = async (req: Request, res: Response) => {
  const product = req.body as ProductAdd;

  try {
    const createResult = await addOrderProduct(product);

    res.status(200).json({ createResult });
  } catch (e) {
    res.status(500).json(e);
  }
};

export const getOrderProducts = async (req: Request, res: Response) => {
  const orderid = req.params.order_id;
  try {
    const products = await getProducts(orderid);
    res.status(200).json(products);
  } catch (e) {
    res.status(500).json(e);
  }
};

export const postFiles = async (req: Request, res: Response) => {
  const body = req.body as any;

  const { files }: { files: any[] } = body;
  const { order_id } = req.params;

  const uploadFiles = [];

  try {
    await deleteFolder('ordenes_compra', `${order_id}`);

    for (const file of files) {
      const path = `${order_id}/${file.name}`;
      const upload = await uploadFile(path, 'ordenes_compra', file.data, {
        contentType: file.type
      });
      uploadFiles.push(upload);
    }
    res.status(200).json({ message: 'Files uploaded' });
  } catch (error) {
    await deleteFolder('ordenes_compra', `${order_id}`);
    console.log(error);
    res.status(500).json(error);
  }
};

export const getFilesC = async (req: Request, res: Response) => {
  const { order_id } = req.params;
  try {
    const files = [];

    const files_array = await getFilesByPath('ordenes_compra', order_id);
    for (const file of files_array) {
      const { signedUrl } = await getFilePublicURL('ordenes_compra', `${order_id}/${file.name}`);
      files.push({
        name: file.name,
        data: signedUrl,
        type: file.metadata.mimetype
      });
    }
    res.status(200).json(files);
  } catch (error: any) {
    res.status(500).json(error);
  }
};
