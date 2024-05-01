import { createUsuario, deleteUsuario, editUsuario, getUsuarios } from '@/utils/usuarios';
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

    if (password !== confirmed_password) {
      return res.status(400).json({ error: 'Las contraseñas no coinciden' });
    }

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
