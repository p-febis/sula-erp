import {
  Body,
  Controller,
  HttpException,
  Post,
  Get,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthenticationService } from "./authentication.service";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { ApiResponse } from "../api-response";
import { LoginUserDto } from "./dto/login-user.dto";
import type { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticationGuard } from "./authentication.guard";

@Controller("authentication")
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post("register")
  async postRegister(@Body() registerUserDto: CreateUserDto) {
    const user = await this.authenticationService.register(registerUserDto);

    if (user.isErr()) {
      throw new HttpException(ApiResponse.error("Failed to create user"), 500);
    }

    return ApiResponse.success(null, 201);
  }

  @Post("login")
  async postLogin(
    @Res({ passthrough: true }) response: FastifyReply,
    @Body() loginUserDto: LoginUserDto,
  ) {
    const user = await this.authenticationService.login(loginUserDto);

    if (user.isErr()) {
      throw new HttpException(
        ApiResponse.error("Failed to login user", 401),
        401,
      );
    }

    const { accessToken, sessionToken } = user.value;

    // TODO: Add production flags for a secure cookie
    response.setCookie("sessionToken", sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });

    return ApiResponse.success({ accessToken }, 200);
  }

  @Get("profile")
  @UseGuards(AuthenticationGuard)
  async getProfile(@Req() request: FastifyRequest) {
    const userId = request["user"].sub;

    const user = await this.authenticationService.profile(userId);

    if (user.isErr()) {
      throw new HttpException(ApiResponse.error("Failed to get profile"), 500);
    }

    return ApiResponse.success(user.value, 200);
  }

  @Post("refresh")
  async postRefresh(
    @Res() request: FastifyRequest,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    const sessionToken = request.cookies.sessionToken;

    const refreshResult =
      await this.authenticationService.refresh(sessionToken);

    if (refreshResult.isErr()) {
      throw new HttpException(
        ApiResponse.error("Failed to refresh user", 401),
        401,
      );
    }

    response.setCookie("sessionToken", refreshResult.value.sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });

    return ApiResponse.success({
      accessToken: refreshResult.value.accessToken,
    });
  }
}
