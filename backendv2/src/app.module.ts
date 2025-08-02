import { Module } from "@nestjs/common";
import { AuthenticationModule } from "./authentication/authentication.module";
import { UsersModule } from "./users/users.module";
import { DrizzlePostgresModule } from "@knaadh/nestjs-drizzle-postgres";
import { JwtService } from "./jwt/jwt.service";
import { SessionModule } from "./session/session.module";
import { CustomersModule } from './customers/customers.module';

@Module({
  providers: [JwtService],
  controllers: [],
  imports: [
    DrizzlePostgresModule.register({
      tag: "DB",
      postgres: {
        url: process.env.DATABASE_URL,
      },
    }),
    AuthenticationModule,
    UsersModule,
    SessionModule,
    CustomersModule,
  ],
})
export class AppModule {}
