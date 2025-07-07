import { CreateUserDtoSchema, LoginUserDtoSchema } from "@/models/user";
import { ErrorResponse, SuccessResponse } from "@/responses/api";
import { IUserService } from "@/services/UserService";
import { parseBodyAsync } from "@/utils/body-parser";
import { H3Event, setCookie } from "h3";

const TEN_YEARS = 315_360_000_000;

export interface IUserController {
  postCreate(event: H3Event): Promise<SuccessResponse>;
  postLogin(event: H3Event): Promise<SuccessResponse>;
}

export class UserController implements IUserController {
  m_userService: IUserService;

  constructor(userService: IUserService) {
    this.m_userService = userService;
  }

  async postCreate(event: H3Event) {
    let creationData = null;

    try {
      const body = await parseBodyAsync(event);
      creationData = CreateUserDtoSchema.parse(body);
    } catch (error) {
      throw new ErrorResponse("Bad Request", null);
    }

    const { id, username } = await this.m_userService.createUser(creationData);

    return new SuccessResponse("Successfully created user", {
      id,
      username,
    });
  }

  async postLogin(event: H3Event) {
    let loginData = null;

    try {
      const body = await parseBodyAsync(event);
      loginData = LoginUserDtoSchema.parse(body);
    } catch (error) {
      throw new ErrorResponse("Bad Request", null);
    }

    const { accessToken, refreshToken } =
      await this.m_userService.loginUser(loginData);

    setCookie(event, "refreshToken", refreshToken, {
      maxAge: TEN_YEARS,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });

    return new SuccessResponse("Successfully logged in user", {
      accessToken,
    });
  }
}
