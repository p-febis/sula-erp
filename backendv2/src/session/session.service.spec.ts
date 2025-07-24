import { Test, TestingModule } from "@nestjs/testing";
import { SessionService } from "./session.service";
import { describe, beforeEach, it, expect, jest } from "@jest/globals";
import { SessionRepository } from "./session.repository";
import { err, ok } from "neverthrow";
import * as schema from "../db/schema";

describe("SessionService", () => {
  let service: SessionService;

  const mockSessionRepository = {
    create: jest.fn(),
    findById: jest.fn(),
  } as unknown as jest.Mocked<SessionRepository>;

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        {
          provide: SessionRepository,
          useValue: mockSessionRepository,
        },
      ],
    }).compile();

    service = module.get<SessionService>(SessionService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("Creation", () => {
    it("should generate a session", async () => {
      let mockedSession: typeof schema.sessionsTable.$inferSelect;

      mockSessionRepository.create.mockImplementationOnce(
        async (userId, id, hash) => {
          mockedSession = {
            id,
            userId,
            secretHash: hash,
          };
          return ok(mockedSession);
        },
      );

      const session = await service.createSession(1);

      expect(mockSessionRepository.create).toHaveBeenCalledWith(
        1,
        expect.any(String),
        expect.any(String),
      );

      expect(session).toEqual(
        ok({
          ...mockedSession,
          sessionToken: expect.any(String),
        }),
      );

      const value = session._unsafeUnwrap();

      const [id, secret] = value.sessionToken.split(".");
      expect(secret).not.toEqual(value.secretHash);
    });
  });

  describe("Verification", () => {
    it("should verify a session", async () => {
      /*
       * Id: InEZiWr9Km4PWgM99tK51oPP
       * Secret: nz4HTgiNrwx0w6Pe5PyMvkie
       * SecretHash: 3c73036911d0a9fcb9cd7ec050452329ec8889b108b9947ccaff40b1cc5ab19f
       */
      const sessionToken = "InEZiWr9Km4PWgM99tK51oPP.nz4HTgiNrwx0w6Pe5PyMvkie";

      const mockSession = {
        id: "InEZiWr9Km4PWgM99tK51oPP",
        userId: 1,
        secretHash:
          "3c73036911d0a9fcb9cd7ec050452329ec8889b108b9947ccaff40b1cc5ab19f",
      };

      mockSessionRepository.findById.mockResolvedValueOnce(ok(mockSession));

      const sessionResult = await service.verifySession(sessionToken);

      expect(mockSessionRepository.findById).toHaveBeenCalledWith(
        "InEZiWr9Km4PWgM99tK51oPP",
      );

      expect(sessionResult).toEqual(ok(mockSession));
    });

    it("should return an error if the session token does not exist", async () => {
      mockSessionRepository.findById.mockResolvedValueOnce(ok(null));

      const sessionResult = await service.verifySession(
        "InEZiWr9Km4PWgM99tK51oPP.nz4HTgiNrwx0w6Pe5PyMvkie",
      );

      expect(mockSessionRepository.findById).toHaveBeenCalledWith(
        "InEZiWr9Km4PWgM99tK51oPP",
      );

      expect(sessionResult).toEqual(err("Invalid session token"));
    });

    it("should return an error if the secret hash does not match", async () => {
      const sessionToken = "InEZiWr9Km4PWgM99tK51oPP.this-secret-is-invalid";

      const mockSession = {
        id: "InEZiWr9Km4PWgM99tK51oPP",
        userId: 1,
        secretHash:
          "3c73036911d0a9fcb9cd7ec050452329ec8889b108b9947ccaff40b1cc5ab19f",
      };

      mockSessionRepository.findById.mockResolvedValueOnce(ok(mockSession));

      const sessionResult = await service.verifySession(sessionToken);

      expect(mockSessionRepository.findById).toHaveBeenCalledWith(
        "InEZiWr9Km4PWgM99tK51oPP",
      );

      expect(sessionResult).toEqual(err("Invalid session token"));
    });
  });
});
