import { UserModel } from "../db/models/userModel";
import { UserDTO } from "../repositories/userRepository";

export const UserMapper = (userModel: UserModel): UserDTO => {
  const untypedUser = userModel as any;
  return {
    id: untypedUser.id,
    name: untypedUser.name,
  };
};
