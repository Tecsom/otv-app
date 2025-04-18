import { deleteFolder, getFilePublicURL, getFilesByPath, uploadFile } from './../utils/storage';
import { Request, Response } from 'express';
import {
  getOrdenesCompra,
  createNewOrder,
  addOrderProduct,
  getOrdenesCompraPaging,
  getProducts,
  updateOrder,
  deleteOrder,
  removeOrderProduct,
  OrderProductEdit,
  getProductsCodes,
  generarOrdenDeCompraEstatica,
  verifyProds,
  getStaticOrden,
  regenerateOrderCodes
} from './../utils/ordenes_compra';
import type { CreateOrderDataModel, ProductAdd } from '@/types/ordenes_compra';
import { Pieza } from '@/types/piezas';

export const getOrdenes = async (req: Request, res: Response) => {
  try {
    const ordenes = await getOrdenesCompra();
    res.status(200).json(ordenes);
  } catch (error: any) {
    res.status(500).json(error);
  }
};

export const deleteOrden = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const deleteResult = await deleteOrder(parseInt(id));
    res.status(200).json(deleteResult);
  } catch (e) {
    res.status(500).json(e);
  }
};

export const generateOrder = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const Result = await generarOrdenDeCompraEstatica(data);
    res.status(200).json(Result.data);
  } catch (error: any) {
    console.log({ error });
    res.status(500).json(error);
  }
};

export const verifyProductsOrder = async (req: Request, res: Response) => {
  try {
    const { order_id, piezas_verificadas, created_at, user_id: userId } = req.body;
    const Result = await verifyProds(parseInt(order_id), piezas_verificadas, created_at, userId);
    return res.status(200).json({ message: 'Productos verificados' });
  } catch (error: any) {
    console.log('entra error');
    console.log({ error });
    res.status(500).json(error);
  }
};

export const putOrder = async (req: Request, res: Response) => {
  const payload = req.body;
  try {
    if (payload?.estado === 'finalizada') {
      const isCompleted = await isOrderCompleted(payload.id);
      if (!isCompleted) throw new Error('La orden no ha sido completada');
    }

    const updateResult = await updateOrder(payload);
    res.status(200).json(updateResult);
  } catch (e) {
    const err = e as Error;
    res.status(500).json({
      message: err?.message || 'Internal server error'
    });
  }
};

export const updateOrderCodesController = async (req: Request, res: Response) => {
  const { orderId } = req.body;
  try {
    await regenerateOrderCodes(orderId);
    res.status(200).json({
      message: 'Códigos actualizados'
    });
  } catch (error: any) {
    res.status(500).json(error);
  }
};

export const getOrdenesPagingC = async (req: Request, res: Response) => {
  try {
    const { page, pageSize, search, estatusFiltersStr, createdAtFilterString, deliveryDateFilterString } = req.query;

    console.log({ page, pageSize, search, estatusFiltersStr, createdAtFilterString, deliveryDateFilterString });

    const estatusFilters = estatusFiltersStr ? (estatusFiltersStr as string).split(',') : [];
    const createdAtFilter = createdAtFilterString ? (createdAtFilterString as string).split(',') : null;
    const deliveryDateFilter = deliveryDateFilterString ? (deliveryDateFilterString as string).split(',') : null;

    const ordenes = await getOrdenesCompraPaging(
      parseInt(page as string),
      parseInt(pageSize as string),
      search as string,
      estatusFilters as string[],
      createdAtFilter as any[],
      deliveryDateFilter as any[]
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

    console.log(products);

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
    await updateOrder({
      id: parseInt(order_id),
      last_update: new Date().toISOString()
    });
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

export const deleteOrderProduct = async (req: Request, res: Response) => {
  const productOrderid = req.params.product_id;

  try {
    const deleteResult = await removeOrderProduct(productOrderid);
    res.status(200).json({ deleteResult });
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
};

export const editOrderProduct = async (req: Request, res: Response) => {
  const payload = req.body;

  try {
    const editResult = await OrderProductEdit(payload);
    res.status(200).json({ editResult });
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
};

export const getStaticOrderC = async (req: Request, res: Response) => {
  const { order_id } = req.params;
  console.log('entra');
  let ordenData = await getStaticOrden(parseInt(order_id));
  console.log('pasa');
  const code_string = ordenData?.cliente?.code_string;

  ordenData.cliente.code_string = JSON.parse(code_string);

  res.status(200).json(ordenData);
};

export const isOrderCompleted = async (orderId: number) => {
  const staticOrder = await getStaticOrden(orderId);

  let piezas = 0;
  let piezas_verificadas = 0;

  for (const producto of staticOrder.codigos) {
    const main_prod = staticOrder?.productos?.find((prod: any) => prod.codigos.includes(producto.code));
    if (main_prod.type === 'bulk') {
      const quantity = producto.data.reduce((acc: any, item: any) => acc + item.quantity, 0);
      const main_quantity = main_prod.quantity;

      if (quantity > 0) {
        const percentaje = quantity / main_quantity;
        piezas_verificadas += percentaje;
      }
      piezas++;
    } else {
      if (producto.verified) {
        piezas_verificadas++;
      }
      piezas++;
    }
  }

  const progress = (piezas_verificadas / piezas) * 100;

  return progress >= 100;
};
