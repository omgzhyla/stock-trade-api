import { Model } from "objection";
import { UserModel } from "./userModel";

export class TradeModel extends Model {
  static get tableName() {
    return "trades";
  }

  static relationMappings = {
    user: {
      relation: Model.HasOneRelation,
      modelClass: UserModel,
      join: {
        from: `trades.user_id`,
        to: `user.id`,
      },
    },
  };

  static get relatedFindQueryMutates() {
    return false;
  }
}
