import { HTTPError } from "h3";

export class ApiResponse<T = unknown> extends HTTPError {
  constructor(status: number, statusText: string, message: string, data: T) {

    super({
      status,
      statusText,
      message,
      data
    });
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
