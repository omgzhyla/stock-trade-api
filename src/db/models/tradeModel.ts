import { Model } from "objection";
import { UserModel } from "./userModel";

export class TradeModel extends Model {
  static get tableName() {
    return "trades";
  }

  static relationMappings = {
    users: {
      relation: Model.HasOneRelation,
      modelClass: UserModel,
      join: {
        from: `${TradeModel.tableName}.user_id`,
        to: `${UserModel.tableName}.id`,
      },
    },
  };

  static get relatedFindQueryMutates() {
    return false;
  }
}
