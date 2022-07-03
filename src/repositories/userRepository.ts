import { UserMapper } from "../mappers/userMapper";
// import { ForeignKeyViolationError } from "objection";
import { UserModel } from "../db/models/userModel";
import { TradeModel } from "../db/models/tradeModel";

export type User = {
  id: number;
  name: string;
};

export interface IUserRepository {
  createIfNotExists(_user: User): Promise<User | null>;
  truncate(): Promise<void>;
  get(_id: number): Promise<User | null>;
}

export class UserRepository implements IUserRepository {
  async createIfNotExists(user: User): Promise<User | null> {
    const userModel = await UserModel.query()
      .insert(user)
      .onConflict()
      .ignore();
    return userModel instanceof UserModel ? UserMapper(userModel) : null;
  }
  async truncate(): Promise<void> {
    await TradeModel.query().truncate();
  }
  async get(id: number): Promise<User | null> {
    const userModel = await UserModel.query().findById(id);
    return userModel instanceof UserModel ? UserMapper(userModel) : null;
  }
}
