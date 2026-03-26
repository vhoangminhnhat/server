export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export function okResponse<T>(data: T, message = 'Success'): ApiResponse<T> {
  return {
    code: 0,
    message,
    data,
  };
}
