import { Model } from "objection";
import { UserModel } from ".";

export class TradeModel extends Model {
  static get tableName() {
    return "trades";
  }

  static relationMappings = {
    users: {
      relation: Model.HasOneRelation,
      modelClass: UserModel,
      join: {
        from: "trades.user_id",
        to: "users.id",
      },
    },
  };

  static get relatedFindQueryMutates() {
    return false;
  }
}
