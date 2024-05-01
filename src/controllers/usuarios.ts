import { getUsuarios } from '@/utils/usuarios';
import { Request, Response } from 'express';

export const getUsuariosC = async (req: Request, res: Response) => {
  try {
    const usuarios = await getUsuarios();
    return res.status(200).json(usuarios);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
