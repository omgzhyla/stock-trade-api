import { UserMapper } from "../mappers";
import { UserModel, TradeModel } from "../db/models";

export type UserDTO = {
  id: number;
  name: string;
};

export interface IUserRepository {
  createIfNotExists(_user: UserDTO): Promise<UserDTO | null>;
  truncate(): Promise<void>;
  get(_id: number): Promise<UserDTO>;
  getAll(): Promise<UserDTO[]>;
}

export class UserRepository implements IUserRepository {
  async createIfNotExists(user: UserDTO): Promise<UserDTO | null> {
    const userModel = await UserModel.query()
      .insert(user)
      .onConflict()
      .ignore();
    return userModel instanceof UserModel ? UserMapper(userModel) : null;
  }
  async truncate(): Promise<void> {
    await TradeModel.query().truncate();
  }
  async get(id: number): Promise<UserDTO> {
    const userModel = await UserModel.query().findById(id).throwIfNotFound();
    return UserMapper(userModel);
  }
  async getAll(): Promise<UserDTO[]> {
    const userModels: UserModel[] = await UserModel.query().orderBy(
      UserModel.idColumn as string
    );
    return userModels.map((row) => UserMapper(row));
  }
}
