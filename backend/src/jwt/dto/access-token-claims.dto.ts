export class AccessTokenClaimsDto {
  sub: number;
  isSuperUser: boolean;
  permissions?: string[];
}
