import createClient from './config/supabase.js';
import jwt from 'jsonwebtoken';

export default async function (req, res, next) {
  const cookies = req.cookies;
  const authToken = cookies.accessToken;
  const supabase = createClient();

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
    const user = jwt.verify(
      authToken,
      'vc502qBBuj7Mp3O03gsb/DI6WI/pvosD8QtS8TkhMxwoa0PyhQ2DRTTnoAbfkUnXWdW+PoU4pEynkkxhZOC2YA=='
    );

    if (req.url.includes('/login')) return res.redirect('/');
    next();
  } catch (error) {
    console.log({ error });
    res.clearCookie('accessToken');
    return res.redirect('/login?redirect=/' + req.url.slice(1));
  }
}

const apiMiddleware = async (req, res, next) => {
  const cookies = req.cookies;
  const authToken = cookies.accessToken;

  if (req.url.includes('auth')) return next();

  if (!authToken) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // try {
  //   await admin.auth().verifySessionCookie(authToken);
  //   next();
  // } catch (error) {
  //   res.status(401).json({ message: 'Unauthorized' });
  // }
};
