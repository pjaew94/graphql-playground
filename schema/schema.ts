import {
  GraphQLInt,
  GraphQLString,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull,
} from "graphql";
import axios from "axios";

// Company schema
const CompanyType: any = new GraphQLObjectType({
  name: "Company",
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    users: {
      type: new GraphQLList(UserType),
      resolve(parentValue, args) {
        return axios
          .get(`http://localhost:3000/companies/${parentValue.id}/users`)
          .then((res) => res.data);
      },
    },
  }),
});

// Standard user schema with guaranteed fields
const UserType: any = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
    company: {
      type: CompanyType,
      resolve(parentValue, args) {
        return axios
          .get(`http://localhost:3000/companies/${parentValue.companyId}`)
          .then((res) => res.data);
      },
    },
  }),
});

// Create RootQuery (initial node) to tell where GraphQL to start
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args): object {
        return axios
          .get(`http://localhost:3000/users/${args.id}`)
          .then((res) => res.data);
      },
    },
    company: {
      type: CompanyType,
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args): object {
        return axios
          .get(`http://localhost:3000/companies/${args.id}`)
          .then((res) => res.data);
      },
    },
  },
});

const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addUser: {
      type: UserType,
      args: {
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
        companyId: { type: GraphQLString },
      },
      resolve(parentValue, { firstName, age }): Promise<void | object> {
        return axios
          .post(`http://localhost:3000/users`, { firstName, age })
          .then((res) => res.data);
      },
    },
    deleteUser: {
      type: GraphQLList(UserType),
      args: {
        userId: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(parentValue, { userId }): Promise<void | object> {
        await axios.delete(`http://localhost:3000/users/${userId}`);
        const res = await axios.get("http://localhost:3000/users");
        return res.data;
      },
    },
    editUser: {
        type: UserType,
        args: {
            userId: { type: new GraphQLNonNull(GraphQLString) },
            firstName: { type: GraphQLString },
            age: { type: GraphQLInt },
            companyId: { type: GraphQLString }
        },
        async resolve(parentValue, { userId, firstName, age, companyId }): Promise<void | object> {
            return await axios.patch(`http://localhost:3000/users/${userId}`, { firstName, age, companyId });
        }   
    }
  },
});

// Creates instance schema of the given query
export const schema = new GraphQLSchema({
  query: RootQuery,
  mutation,
});
