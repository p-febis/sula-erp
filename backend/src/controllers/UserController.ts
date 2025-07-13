import { CreateUserDtoSchema, LoginUserDtoSchema } from "@/models/user";
import { ErrorResponse, SuccessResponse } from "@/responses/api";
import { IAuthorizationService } from "@/services/AuthorizationService";
import { IUserService } from "@/services/UserService";
import { parseBodyAsync } from "@/utils/body-parser";
import { parseCookie } from "@/utils/cookie-parser";
import { H3Event, setCookie } from "h3";

const TEN_YEARS = 315_360_000_000;

export interface IUserController {
  postCreate(event: H3Event): Promise<SuccessResponse>;
  postLogin(event: H3Event): Promise<SuccessResponse>;
  postRefresh(event: H3Event): Promise<SuccessResponse>;
  getAllUsers(event: H3Event): Promise<SuccessResponse>;
}

export class UserController implements IUserController {
  m_userService: IUserService;
  m_authorizationService: IAuthorizationService;

  constructor(userService: IUserService, authorizationService: IAuthorizationService) {
    this.m_userService = userService;
    this.m_authorizationService = authorizationService;
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

  async postRefresh(event: H3Event) {
    const refreshTokenData = parseCookie(event, "refreshToken")!;
    const { accessToken, refreshToken } =
      await this.m_userService.refreshUser(refreshTokenData);

    setCookie(event, "refreshToken", refreshToken, {
      maxAge: TEN_YEARS,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });

    return new SuccessResponse("Successfully refreshed user", {
      accessToken,
    });
  }

  async getAllUsers(event: H3Event) {
    const canDo = this.m_authorizationService.userCanDo(
      event.context.claims,
      ["read:user"],
    );

    if (!canDo) {
      throw new ErrorResponse("Forbidden", null, 403, "Forbidden");
    }

    const users = await this.m_userService.findAllUsers();

    return new SuccessResponse("Success", users);
  }
}
