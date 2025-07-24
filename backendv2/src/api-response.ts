export class ApiResponse<T = any> {
  constructor(
    public statusCode: number,
    public data: T,
    public statusText: string = ApiResponse.getStatusText(statusCode)
  ) {}

  static getStatusText(statusCode: number): string {
    const statusTexts: Record<number, string> = {
      200: "OK",
      201: "Created",
      404: "Not Found",
      500: "Internal Server Error"
    };
    return statusTexts[statusCode] || "Unknown";
  }

  static success<T>(data: T, statusCode = 200): ApiResponse<T> {
    return new ApiResponse(statusCode, data);
  }

  static error(message: string, statusCode = 500): ApiResponse<{ message: string }> {
    return new ApiResponse(statusCode, { message });
  }
}
