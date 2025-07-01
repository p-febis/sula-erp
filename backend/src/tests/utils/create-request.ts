import { H3Event } from "h3";
import { IncomingMessage, ServerResponse } from "http";
import { Readable } from "stream";

export function createH3Event({
  method,
  url = "/",
  body = {},
  headers = { "content-type": "application/json" },
}: {
  method: "POST" | "GET" | "PATCH" | "PUT",
  url?: string,
  body?: Record<string, any>,
  headers?: Record<string, string>,
}) {
  const req = new Readable({
    read() {
      this.push(JSON.stringify(body));
      this.push(null);
    }
  }) as IncomingMessage;

  req.headers = headers;
  req.method = method;
  req.url = url;
  req.text = async() => JSON.stringify(body);

  const res = {
    setHeader: () => {},
    getHeader: () => {},
    removeHeader: () => {},
    end: () => {},
    statusCode: 200,
  } as unknown as ServerResponse;

  return new H3Event(req, res);
}
