"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = void 0;
const graphql_1 = require("graphql");
const axios_1 = __importDefault(require("axios"));
// Company schema
const CompanyType = new graphql_1.GraphQLObjectType({
    name: "Company",
    fields: () => ({
        id: { type: graphql_1.GraphQLString },
        name: { type: graphql_1.GraphQLString },
        description: { type: graphql_1.GraphQLString },
        users: {
            type: new graphql_1.GraphQLList(UserType),
            resolve(parentValue, args) {
                return axios_1.default
                    .get(`http://localhost:3000/companies/${parentValue.id}/users`)
                    .then((res) => res.data);
            },
        },
    }),
});
// Standard user schema with guaranteed fields
const UserType = new graphql_1.GraphQLObjectType({
    name: "User",
    fields: () => ({
        id: { type: graphql_1.GraphQLString },
        firstName: { type: graphql_1.GraphQLString },
        age: { type: graphql_1.GraphQLInt },
        company: {
            type: CompanyType,
            resolve(parentValue, args) {
                return axios_1.default
                    .get(`http://localhost:3000/companies/${parentValue.companyId}`)
                    .then((res) => res.data);
            },
        },
    }),
});
// Create RootQuery (initial node) to tell where GraphQL to start
const RootQuery = new graphql_1.GraphQLObjectType({
    name: "RootQueryType",
    fields: {
        user: {
            type: UserType,
            args: { id: { type: graphql_1.GraphQLString } },
            resolve(parentValue, args) {
                return axios_1.default
                    .get(`http://localhost:3000/users/${args.id}`)
                    .then((res) => res.data);
            },
        },
        company: {
            type: CompanyType,
            args: { id: { type: graphql_1.GraphQLString } },
            resolve(parentValue, args) {
                return axios_1.default
                    .get(`http://localhost:3000/companies/${args.id}`)
                    .then((res) => res.data);
            },
        },
    },
});
const mutation = new graphql_1.GraphQLObjectType({
    name: "Mutation",
    fields: {
        addUser: {
            type: UserType,
            args: {
                firstName: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
                age: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
                companyId: { type: graphql_1.GraphQLString },
            },
            resolve(parentValue, { firstName, age }) {
                return axios_1.default
                    .post(`http://localhost:3000/users`, { firstName, age })
                    .then((res) => res.data);
            },
        },
        deleteUser: {
            type: graphql_1.GraphQLList(UserType),
            args: {
                userId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
            },
            resolve(parentValue, { userId }) {
                return __awaiter(this, void 0, void 0, function* () {
                    yield axios_1.default.delete(`http://localhost:3000/users/${userId}`);
                    const res = yield axios_1.default.get("http://localhost:3000/users");
                    return res.data;
                });
            },
        },
        editUser: {
            type: UserType,
            args: {
                userId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
                firstName: { type: graphql_1.GraphQLString },
                age: { type: graphql_1.GraphQLInt },
                companyId: { type: graphql_1.GraphQLString }
            },
            resolve(parentValue, { userId, firstName, age, companyId }) {
                return __awaiter(this, void 0, void 0, function* () {
                    return yield axios_1.default.patch(`http://localhost:3000/users/${userId}`, { firstName, age, companyId });
                });
            }
        }
    },
});
// Creates instance schema of the given query
exports.schema = new graphql_1.GraphQLSchema({
    query: RootQuery,
    mutation,
});
