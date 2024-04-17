import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export default async function (req: Request, res: Response, next: NextFunction) {
  const cookies = req.cookies;
  const authToken = cookies.accessToken;

  if (req.url.includes('/api')) {
    return apiMiddleware(req, res, next);
  }

  if (!authToken && !req.url.includes('/login')) {
    return res.redirect('/login?redirect=/' + req.url.slice(1));
  }
  if (req.url.includes('/login') && !authToken) {
    return next();
  }
  try {
    jwt.verify(authToken, 'vc502qBBuj7Mp3O03gsb/DI6WI/pvosD8QtS8TkhMxwoa0PyhQ2DRTTnoAbfkUnXWdW+PoU4pEynkkxhZOC2YA==');

    if (req.url.includes('/login')) return res.redirect('/');
    next();
  } catch (error) {
    console.log({ error });
    res.clearCookie('accessToken');
    return res.redirect('/login?redirect=/' + req.url.slice(1));
  }
}

const apiMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const cookies = req.cookies;
  const authToken = cookies.accessToken;

  if (req.url.includes('auth')) return next();

  if (!authToken) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};
