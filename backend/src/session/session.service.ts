import { Injectable } from "@nestjs/common";
import { SessionRepository } from "./session.repository";
import { randomBytes } from "crypto";
import crypto from "crypto";
import { err } from "neverthrow";

function generateSecureString(length: number): string {
  return randomBytes(length).toString("hex").slice(0, length);
}

function hashSHA256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

@Injectable()
export class SessionService {
  constructor(private readonly sessionRespository: SessionRepository) {}

  async createSession(userId: number) {
    const [id, secret] = [generateSecureString(24), generateSecureString(24)];
    const secretHash = hashSHA256(secret);

    const sessionResult = await this.sessionRespository.create(
      userId,
      id,
      secretHash,
    );

    if (sessionResult.isErr()) return sessionResult;

    return sessionResult.map((s) => ({
      ...s,
      sessionToken: id + "." + secret,
    }));
  }

  async verifySession(sessionToken: string) {
    const parts = sessionToken.split(".");
    if (parts.length !== 2) return err("Invalid session token");

    const [id, secret] = parts;

    const sessionResult = await this.sessionRespository.findById(id);

    if (sessionResult.isErr() || sessionResult.value === null)
      return err("Invalid session token");

    const secretHash = hashSHA256(secret);
    const validSecret = crypto.timingSafeEqual(
      new TextEncoder().encode(secretHash),
      new TextEncoder().encode(sessionResult.value.secretHash),
    );

    if (!validSecret) return err("Invalid session token");

    return sessionResult;
  }
}
