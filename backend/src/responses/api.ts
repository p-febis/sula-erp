import { HTTPError } from "h3";

export class ApiResponse<T = unknown> {
  constructor(
    public status: number,
    public statusText: string,
    public message: string,
    public data: T,
  ) {}
}
export class SuccessResponse<T = unknown> {
  constructor(
    public message: string,
    public data: T,
    public status = 200,
    public statusText = "OK",
  ) {}

  toJSON() {
    return {
      status: this.status,
      statusText: this.statusText,
      message: this.message,
      data: this.data,
    };
  }
}

export class ErrorResponse<T = unknown> extends HTTPError {
  data: T;

  constructor(
    message: string,
    data: T,
    status = 400,
    statusText = "Bad Request",
  ) {
    super({
      status,
      statusText,
      message,
      data,
    });
    this.data = data;
  }
}
