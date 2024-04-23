import supabase from '@/config/supabase';
import { decode } from 'base64-arraybuffer';

export const uploadFile = async (path: string, bucket: string, file: string, object: object): Promise<boolean> => {
  const { data, error } = await supabase().storage.from(bucket).upload(path, decode(file), object);
  if (error) {
    console.error('Error uploading file:', error.message);
    throw error;
  }
  return true;
};

export const deleteFile = async (filename: string, bucket: string): Promise<boolean> => {
  const { error } = await supabase().storage.from(bucket).remove([filename]);
  if (error) {
    console.error('Error deleting file:', error.message);
    throw error;
  }
  return true;
};

export const getFiles = async (bucket: string): Promise<string[]> => {
  const { data, error } = await supabase().storage.from(bucket).list();
  if (error) {
    console.error('Error fetching files:', error.message);
    throw error;
  }
  return data.map(file => file.name);
};
