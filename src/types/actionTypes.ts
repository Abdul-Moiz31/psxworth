export type SuccessResponse<T = any> = {
  data?: T;
  status: number;
  success: true;
  message: string;
};

export type ErrorResponse = {
  status: number;
  success: false;
  message: string;
};

export type ServerFunctionResponse<T = any> = SuccessResponse<T> | ErrorResponse;

export type FormState = {
  message: string;
  success: boolean;
};
