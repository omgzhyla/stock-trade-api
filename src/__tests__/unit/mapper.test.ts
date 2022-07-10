import { TradeDTO } from "../../repositories/tradeRepository";
import { TradeModel } from "../../db/models/tradeModel";
import { TradeMapper } from "../../mappers/tradeMapper";
import { UserDTO } from "../../repositories/userRepository";
import { UserModel } from "../../db/models/userModel";
import { UserMapper } from "../../mappers/userMapper";

describe("TradeMapper and UserMapper", () => {
  it("maps Trade from DTO to model and back", async () => {
    const tradeDTO: TradeDTO = {
      id: 1,
      type: "buy",
      userId: 1,
      symbol: "AC",
      shares: 28,
      price: 162.17,
      timestamp: new Date("2014-06-14 13:13:13"),
    };
    const tradeModel: TradeModel = TradeModel.fromJson(tradeDTO);
    expect(tradeDTO).toEqual(TradeMapper(tradeModel));
  });
  it("maps User from DTO to model and back", async () => {
    const userDTO: UserDTO = {
      id: 1,
      name: "David",
    };
    const userModel: UserModel = UserModel.fromJson(userDTO);
    expect(userDTO).toEqual(UserMapper(userModel));
  });
});
