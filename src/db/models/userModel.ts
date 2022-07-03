import { Model } from "objection";
import { TradeModel } from "./tradeModel";

export class UserModel extends Model {
  static get tableName() {
    return "users";
  }
  static relationMappings = {
    trades: {
      relation: Model.HasManyRelation,
      modelClass: TradeModel,
      join: {
        from: `users.id`,
        to: `trades.user_id`,
      },
    },
  };

  static get relatedFindQueryMutates() {
    return false;
  }
}
