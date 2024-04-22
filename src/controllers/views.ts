import { getClientById, getClientes } from './../utils/clientes';
import { Request, Response } from 'express';
import path from 'path';

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
  try {
    const clientData = await getClientById(id);

    res.render('cliente.ejs', { clientData });
  } catch (error) {
    res.status(404).render('404.ejs');
  }
};
