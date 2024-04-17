import { Request, Response } from 'express';
import path from 'path';

export const renderHomePage = (_: Request, res: Response) => res.render('Home.ejs');
export const renderLoginPage = (_: Request, res: Response) =>
  res.render('Login.ejs', { layout: path.resolve(__dirname, '..', 'layouts', 'blank.ejs') });
