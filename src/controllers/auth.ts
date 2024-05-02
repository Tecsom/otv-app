import { Request, Response } from 'express';
import supabase from '@/config/supabase';

export const LoginC = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabase().auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;

    const { data: user_data, error: user_error } = await supabase()
      .from('usuarios')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (user_error) throw user_error;

    const { access_token } = data?.session ?? {};
    if (!access_token) {
      throw new Error('No access token');
    }

    res.status(200).json({
      access_token,
      user: { ...user_data, ...data.user }
    });
  } catch (error: any) {
    res.status(500).json(error);
  }
};
