import { UserModel } from "../db/models/userModel";
import { User } from "../repositories/userRepository";

export const UserMapper = (userModel: UserModel): User => {
  const untypedUser = userModel as any;
  return {
    id: untypedUser.id,
    name: untypedUser.name,
  };
};
