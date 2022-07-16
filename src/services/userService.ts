import { IUserRepository, UserDTO } from "../repositories/userRepository";

export interface IUserService {
  checkIfExists(_id: UserDTO["id"]): Promise<boolean>;
}

export class UserService implements IUserService {
  private userRepository: IUserRepository;
  constructor({ userRepository }: { userRepository: IUserRepository }) {
    this.userRepository = userRepository;
  }
  async checkIfExists(id: UserDTO["id"]) {
    const user = await this.userRepository.get(id);
    return !!user;
  }
}
