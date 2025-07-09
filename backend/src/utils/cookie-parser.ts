import { getCookie, H3Event } from "h3";

// This function exists for testing purposes.
export function parseCookie(event: H3Event, name: string) {
  return getCookie(event, name);
}
