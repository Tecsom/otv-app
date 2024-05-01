import { createUsuario, getUsuarios } from '@/utils/usuarios';
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
