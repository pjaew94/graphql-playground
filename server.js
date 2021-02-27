"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_graphql_1 = require("express-graphql");
const schema_1 = require("./schema/schema");
const app = express_1.default();
app.use("/graphql", express_graphql_1.graphqlHTTP({ schema: schema_1.schema, graphiql: true }));
app.listen(5000, () => {
    console.log("Listening");
});
