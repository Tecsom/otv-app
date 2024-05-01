import supabase from '@/config/supabase';
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
    const decoded = jwt.verify(
      authToken,
      'vc502qBBuj7Mp3O03gsb/DI6WI/pvosD8QtS8TkhMxwoa0PyhQ2DRTTnoAbfkUnXWdW+PoU4pEynkkxhZOC2YA=='
    );

    if (decoded && decoded.sub) {
      const { error: error_rol, data: rol } = await supabase()
        .from('usuarios')
        .select('rol')
        .eq('id', decoded.sub)
        .single();

      if (error_rol) {
        console.log({ error_rol });
        return res.redirect('/login?redirect=/' + req.url.slice(1));
      }
      const rol_data = rol as { [key: string]: any };

      res.cookie('rol', rol_data?.rol, { httpOnly: false, secure: true });
    }

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
  next();
  // if (!authToken) {
  //   return res.status(401).json({ message: 'Unauthorized' });
  // }
};
