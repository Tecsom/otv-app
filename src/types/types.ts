export type FileUpld = {
  name: string;
  data: string;
  type: string;
};

export type ApiResult = {
  data: unknown;
  message: string;
  status: boolean;
};
export type QueryTable = {
  length: string;
  draw: string;
  search: { value: string };
  start: string;
  page: string;
};
