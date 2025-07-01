import { Algorithm, Options, Version } from "@node-rs/argon2";

export const hashingOptions: Options = {
  algorithm: Algorithm.Argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
  version: Version.V0x13,
};
