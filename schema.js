const graphql = require("graphql");
const {
  UpdateUser,
  SignUp,
  DeleteUser,
  CreateHabit,
  UpdateHabit,
  DeleteHabit,
  CompleteAHabit,
  Login,
} = require("./mutations");

const { AllUsers, User, Me } = require("./queries");

const { GraphQLObjectType, GraphQLSchema } = graphql;
const { db } = require("./db-connection");

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: () => ({
    Me,

    AllUsers,

    User,
  }),
});

const RootMutation = new GraphQLObjectType({
  name: "RootMutationType",
  fields: () => ({
    SignUp,

    UpdateUser,

    DeleteUser,

    CreateHabit,

    UpdateHabit,

    DeleteHabit,

    CompleteAHabit,

    Login,
  }),
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
});
