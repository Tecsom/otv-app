import { Request, Response } from 'express';
import { updateChekerPassword, getCheckerPassword } from './../utils/settings'
export const validatePassword = async (req: Request, res: Response) => {
  const { password } = req.query as { password: string };
  const dbpassword = await getCheckerPassword()
  console.log({ password, dbpassword })
  if (password === dbpassword) {
    res.status(200).json({});
  } else {
    res.status(501).json({});
  }
};

export const updateCheckerPass = async (req: Request, res: Response) => {
  const newPassword = req.body.password

  updateChekerPassword(newPassword)

  res.status(200).json({ result: "OK" })
}
