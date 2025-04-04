import {
  createUsuario,
  deleteUsuario,
  editUsuario,
  getUsersTable,
  getUsuarios,
  verifyVerificadorCode
} from '@/utils/usuarios';
import { Request, Response } from 'express';

export const getUsuariosC = async (req: Request, res: Response) => {
  try {
    const usuarios = await getUsuarios();
    return res.status(200).json(usuarios);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createUsuarioC = async (req: Request, res: Response) => {
  try {
    const { password, confirmed_password, ...usuario } = req.body;

    const newUsuario = await createUsuario(usuario, password);
    return res.status(200).json(newUsuario);
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

export const editUsuarioC = async (req: Request, res: Response) => {
  try {
    const usuario = req.body;

    const updatedUsuario = await editUsuario(usuario);
    return res.status(200).json(updatedUsuario);
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

export const deleteUsuarioC = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await deleteUsuario(id);
    return res.status(200).json({ message: 'Usuario eliminado' });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

export const getUsersTableController = async (req: Request, res: Response) => {
  try {
    const { start, length, order: order_raw, search, columns } = req.query as any;
    const { column, dir } = !!order_raw?.length ? order_raw[0] : { column: '', dir: '' };

    const column_name = columns[column]?.data;
    const { users, recordsFiltered } = await getUsersTable(
      start,
      length,
      { id: column_name, dir },
      {
        search: search.value
      }
    );

    res.status(200).json({
      data: users,
      recordsTotal: users.length,
      recordsFiltered: recordsFiltered
    });
  } catch (error) {
    console.error('Error at getSendersTableController', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const verifyVerificadorCodeController = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;

    const userId = await verifyVerificadorCode(code);

    return res.status(200).json(userId);
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};
