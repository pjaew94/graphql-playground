import express from "express";
import { graphqlHTTP } from "express-graphql";
import { schema } from "./schema/schema";

const app = express();

app.use("/graphql", graphqlHTTP({ schema, graphiql: true }));

app.listen(5000, (): void => {
  console.log("Listening");
});
