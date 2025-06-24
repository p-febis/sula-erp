export class ApiResponse<T = unknown> {
  status: number;
  statusText: string;
  message: string;
  data: T;

  constructor(status: number, statusText: string, message: string, data: T) {
    this.status = status;
    this.statusText = statusText;
    this.message = message;
    this.data = data;
  }
}

export class SuccessResponse<T = unknown> extends ApiResponse<T> {
  constructor(message: string, data: T, status = 200, statusText = "OK") {
    super(status, statusText, message, data);
  }
}

export class ErrorResponse<T = unknown> extends ApiResponse<T> {
  constructor(
    message: string,
    data: T,
    status = 400,
    statusText = "Bad Request",
  ) {
    super(status, statusText, message, data);
  }
}
