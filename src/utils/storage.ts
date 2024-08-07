import supabase from '@/config/supabase';
import { decode } from 'base64-arraybuffer';

export const uploadFile = async (path: string, bucket: string, file: string, object: object): Promise<boolean> => {
  //replace path string with the path without . and / to avoid errors expect the extension dot

  const filename = path.split('/').pop();
  const extension = filename?.split('.').pop();
  const filename_sanitized =
    filename
      ?.replace(extension ?? '', '')
      .replace(/\./g, '')
      .replace(/\//g, '') +
    '.' +
    extension;

  path = path.replace(filename!, filename_sanitized);

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

export const getFilesByPath = async (bucket: string, path: string) => {
  const { data, error } = await supabase().storage.from(bucket).list(path);
  if (error) {
    console.error('Error getting files:', error.message);
    throw error;
  }
  return data;
};

export const getFilePublicURL = async (bucket: string, path: string) => {
  const { data, error } = await supabase().storage.from(bucket).createSignedUrl(path, 60);
  if (error) {
    console.error('Error getting file URL:', error.message);
    throw error;
  }
  return data;
};

export const deleteFolder = async (bucket: string, path: string) => {
  const folderFiles = (await supabase().rpc('bucket_get_all', { bucketid: bucket, subpath: path })).data!;
  if (!folderFiles || folderFiles.length === 0) {
    return true;
  }

  const { error } = await supabase()
    .storage.from(bucket)
    .remove(folderFiles.map((file: any) => file?.name));
  if (error) {
    console.error('Error deleting folder:', error.message);
    throw error;
  }

  await supabase().storage.from(bucket).remove([path]);

  return true;
};
