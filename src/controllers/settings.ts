import { Request, Response } from 'express';
import { updateChekerPassword, getCheckerPassword } from './../utils/settings';
import storage from 'node-persist';
import { initScanner } from './scanner';

export const validatePassword = async (req: Request, res: Response) => {
  const { password } = req.query as { password: string };
  const dbpassword = await getCheckerPassword();

  if (password === dbpassword) {
    res.status(200).json({});
  } else {
    res.status(501).json({});
  }
};

export const updateCheckerPass = async (req: Request, res: Response) => {
  const newPassword = req.body.password;

  updateChekerPassword(newPassword);

  res.status(200).json({ result: 'OK' });
};

export const saveDefaultScannerPort = async (req: Request, res: Response) => {
  const port = req.body.port;

  await storage.init();

  await storage.setItem('defaultScannerPort', port);
  await initScanner();

  res.status(200).json({ result: 'OK' });
};
