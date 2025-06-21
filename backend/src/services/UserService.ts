import { CreateUserDto, TUser } from "@/models/user";
import { IUserRepository } from "@/repositories/UserRepository";

export interface IUserService {
  createUser(userCreationData: CreateUserDto): Promise<TUser>;
}

export class UserService implements IUserService {

  m_userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.m_userRepository = userRepository;
  }

  async createUser(userCreationData: CreateUserDto): Promise<TUser> {
    const user = await this.m_userRepository.create(userCreationData);

    if(!user) {
      throw "This user already exists!";
    }

    return user;
  }
}
