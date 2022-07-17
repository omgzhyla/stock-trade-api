export default {
  title: "Stock Trade API",
  $id: "api-schema",
  definitions: {
    user: {
      type: "object",
      properties: {
        id: {
          type: "integer",
        },
        name: {
          type: "string",
        },
      },
      required: ["id", "name"],
    },
    trade: {
      type: "object",
      properties: {
        id: {
          type: "integer",
        },
        type: {
          type: "string",
          enum: ["buy", "sell"],
        },
        user: {
          $ref: "#/definitions/user",
        },
        symbol: {
          type: "string",
        },
        shares: {
          type: "integer",
          minimum: 10,
          maximum: 30,
        },
        price: {
          type: "number",
          format: "price",
          minimum: 130.42,
          maximum: 195.65,
        },
        timestamp: {
          type: "string",
          format: "dateTime",
        },
      },
      required: [
        "id",
        "type",
        "user",
        "symbol",
        "shares",
        "price",
        "timestamp",
      ],
    },
  },
};
