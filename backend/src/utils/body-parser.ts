import { H3Event, readBody } from "h3";

// This function exists for testing purposes.
export async function parseBodyAsync(event: H3Event) {
  return readBody(event);
}
