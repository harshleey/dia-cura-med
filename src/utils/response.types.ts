export class ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;

  private constructor(
    success: boolean,
    message: string,
    data?: T,
    errors?: any,
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.errors = errors;
  }

  static success<T>(message: string, data?: T) {
    return new ApiResponse<T>(true, message, data);
  }

  static error<T>(message: string, data?: T, errors?: any) {
    return new ApiResponse<T>(false, message, data, errors);
  }
}
