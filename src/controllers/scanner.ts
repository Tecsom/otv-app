import { Request, Response } from 'express';
import { Scanner } from '../scanner';

export const listPorts = async (req: Request, res: Response) => {
  try {
    const ports = await Scanner.getPorts();
    res.status(200).json(ports);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
