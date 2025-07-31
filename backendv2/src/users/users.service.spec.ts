import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { UsersRepository } from "./users.repository";
import { ok } from "neverthrow";
import { describe, beforeEach, it, jest, expect } from "@jest/globals";

describe("UsersService", () => {
  let service: UsersService;

  const mockUsersRepository = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    isFirstUser: jest.fn(),
  } as unknown as jest.Mocked<UsersRepository>;

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("Creation", () => {
    it.each([{ isSuperUser: true }, { isSuperUser: false }])(
      "should create a user with valid data and set its superuser status",
      async ({ isSuperUser }) => {
        const sampleUser = {
          id: 1,
          username: "john",
          password:
            "$argon2id$v=19$m=16,t=2,p=1$c2xrZmpzYWY7$GzS30tw+ECXCE2+VatgR+g",
          email: "john@doeenterprises.com",
        };

        mockUsersRepository.findByEmail.mockResolvedValue(
          ok(null) as unknown as never,
        );
        mockUsersRepository.create.mockResolvedValueOnce(
          ok(sampleUser) as unknown as never,
        );

        mockUsersRepository.isFirstUser.mockResolvedValueOnce(ok(isSuperUser));

        const userResult = await service.createUser({
          username: "john",
          email: "john@doeenterprises.com",
          password: "password",
        });

        const calledArguments = mockUsersRepository.create.mock
          .calls[0][0] as unknown as { password: string };

        expect(mockUsersRepository.isFirstUser).toHaveBeenCalledTimes(1);

        expect(mockUsersRepository.create).toHaveBeenCalledTimes(1);
        expect(mockUsersRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            username: "john",
            email: "john@doeenterprises.com",
            password: expect.any(String),
            isSuperUser,
          }),
        );

        expect(calledArguments.password).not.toEqual("password");

        expect(userResult).toEqual(ok(sampleUser));
      },
    );

    it("should return an error when the email is taken", async () => {
      const sampleUser = {
        id: 1,
        username: "john",
        password:
          "$argon2id$v=19$m=16,t=2,p=1$c2xrZmpzYWY7$GzS30tw+ECXCE2+VatgR+g",
        email: "john@doeenterprises.com",
      };

      mockUsersRepository.findByEmail.mockResolvedValueOnce(
        ok(sampleUser) as unknown as never,
      );

      const userResult = await service.createUser({
        username: "john",
        email: "john@doeenterprises.com",
        password: "password",
      });

      expect(mockUsersRepository.findByEmail).toHaveBeenCalledTimes(1);
      expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith(
        "john@doeenterprises.com",
      );
      expect(userResult.isErr()).toBeTruthy();
      expect(mockUsersRepository.create).not.toHaveBeenCalled();
    });
  });
});
