import { IUserRepository, UserDTO } from "../repositories";

export interface IUserService {
  checkIfExists(_id: UserDTO["id"]): Promise<boolean>;
}

export class UserService implements IUserService {
  private userRepository: IUserRepository;
  constructor({ userRepository }: { userRepository: IUserRepository }) {
    this.userRepository = userRepository;
  }
  async checkIfExists(id: UserDTO["id"]) {
    await this.userRepository.get(id);
    return true;
  }
}
