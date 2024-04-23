export type FileUpld = {
  name: string;
  data: string;
  type: string;
};

export type ApiResult = {
  data: unknown,
  message: string,
  status: boolean
}