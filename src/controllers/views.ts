import { getPiezas } from '@/utils/piezas';
import { getClientById, getClientes } from './../utils/clientes';
import { Request, Response } from 'express';
import path from 'path';
import { getStaticOrden } from '@/utils/ordenes_compra';
import { getFilePublicURL } from '@/utils/storage';
import { getUsuarios } from '@/utils/usuarios';
import { getCheckerPassword } from '@/utils/settings';
import storage from 'node-persist';
import { getProductById } from '@/utils/inventory';

export const renderHomePage = (_: Request, res: Response) => res.render('Home.ejs');
export const renderUnidadesMedida = (_: Request, res: Response) => res.render('unidadesMedida.ejs');
export const renderLoginPage = (_: Request, res: Response) =>
  res.render('Login.ejs', { layout: path.resolve(__dirname, '..', 'layouts', 'blank.ejs') });

export const renderClientsPage = async (_: Request, res: Response) => {
  const clientes = await getClientes();

  res.render('clientes.ejs', { clientes });
};

export const renderClientPage = async (req: Request, res: Response) => {
  const { id } = req.params;
  const cliente_id = parseInt(id);
  let profile_picture;

  try {
    profile_picture = await getFilePublicURL('clientes', `${cliente_id}/logo.png`);
  } catch (error) {}

  try {
    const clientData = await getClientById(id);
    const piezasData = await getPiezas(cliente_id);
    console.log({ clientData });

    res.render('cliente.ejs', { clientData, piezasData, profile_picture });
  } catch (error) {
    res.status(404).render('404.ejs');
  }
};

export const renderOrdenesCompra = async (req: Request, res: Response) => {
  try {
    res.render('ordenes_compra.ejs');
  } catch (error) {
    res.status(404).render('404.ejs');
  }
};

export const renderVerificador = async (_: Request, res: Response) =>
  res.render('verificador.ejs', { layout: './../layouts/horizontal.ejs' });
export const renderVerificadorEmbarques = async (_: Request, res: Response) =>
  res.render('verificador-embarques.ejs', { layout: './../layouts/horizontal.ejs' });
export const renderVerificadorOrdenes = async (req: Request, res: Response) => {
  // const { order_id } = req.params;

  // let ordenData = await getStaticOrden(parseInt(order_id));

  // const code_string = ordenData?.cliente?.code_string;

  // ordenData.cliente.code_string = JSON.parse(code_string);

  res.render('verificador-ordenes.ejs', {
    layout: './../layouts/horizontal.ejs'
    // ordenData: JSON.stringify(ordenData)
  });
};
export const renderConfiguracion = async (_: Request, res: Response) => {
  await storage.init();
  const usuarios = await getUsuarios();
  const password = await getCheckerPassword();
  const defaultScannerPort = (await storage.getItem('defaultScannerPort')) ?? null;

  res.render('configuracion.ejs', { usuarios, password, defaultScannerPort });
};
export const renderInventarios = async (_: Request, res: Response) => res.render('inventarios.ejs');
export const renderProductoInventarios = async (req: Request, res: Response) => {
  const { product_id } = req.params;

  try {
    const productData = await getProductById(product_id);
    return res.render('inventarios-producto.ejs', { productData });
  } catch (error) {
    res.status(404).render('404.ejs');
  }
};
export const renderEmbarques = async (_: Request, res: Response) => res.render('embarques.ejs');
export const renderUsersView = async (_: Request, res: Response) => res.render('users.ejs');
