import { Request, Response } from 'express';

export const validatePassword = async (req: Request, res: Response) => {
  const { password } = req.query as { password: string };

  if (password === '1234') {
    res.status(200).json({});
  } else {
    res.status(501).json({});
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  const newPassword = req.body.password
  console.log(newPassword)
  res.status(200).json({ result: "OK" })
}