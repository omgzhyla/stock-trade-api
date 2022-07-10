import { UserMapper } from "../mappers/userMapper";
// import { ForeignKeyViolationError } from "objection";
import { UserModel } from "../db/models/userModel";
import { TradeModel } from "../db/models/tradeModel";

export type UserDTO = {
  id: number;
  name: string;
};

export interface IUserRepository {
  createIfNotExists(_user: UserDTO): Promise<UserDTO | null>;
  truncate(): Promise<void>;
  get(_id: number): Promise<UserDTO | null>;
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
  async get(id: number): Promise<UserDTO | null> {
    const userModel = await UserModel.query().findById(id);
    return userModel instanceof UserModel ? UserMapper(userModel) : null;
  }
  async getAll(): Promise<UserDTO[]> {
    const userModels: UserModel[] = await UserModel.query().orderBy(
      UserModel.idColumn as string
    );
    return userModels.map((row) => UserMapper(row));
  }
}
