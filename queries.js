const graphql = require("graphql");
const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLBoolean,
  GraphQLList,

  GraphQLSchema,
} = graphql;
const { db } = require("./db-connection");

const TimeCompletedType = new GraphQLObjectType({
  name: "timeCompleted",
  fields: {
    time_completed_id: { type: GraphQLID },
    habit_id: { type: GraphQLID },
    time: { type: GraphQLString },
  },
});

const HabitType = new GraphQLObjectType({
  name: "Habit",
  fields: {
    habit_id: { type: GraphQLID },
    user_id: { type: GraphQLID },
    habit_name: { type: GraphQLString },
    habit_created_at: { type: GraphQLString },
    times_completed: {
      type: new GraphQLList(TimeCompletedType),
      resolve(parentValue, args) {
        const query = `SELECT * FROM public.time_completed WHERE habit_id = ${parentValue.habit_id}`;
        return db.conn
          .many(query)
          .then(data =>
            data.length > 0
              ? data.sort((a, b) =>
                  parseInt(a.time) >= parseInt(b.time) ? 1 : -1
                )
              : []
          )
          .catch(err => []);
      },
    },
    user_name: {
      type: GraphQLString,
      resolve(parentValue, args) {
        const query = `SELECT user_name FROM public.users WHERE user_id = ${parentValue.user_id}`;
        return db.conn
          .one(query)
          .then(data => data.user_name)
          .catch(err => err);
      },
    },
    habit_should_remind: {
      type: GraphQLBoolean,
    },
    habit_reoccur_time: {
      type: GraphQLString,
    },
  },
});

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    user_id: { type: GraphQLID },
    user_name: { type: GraphQLString },
    token: { type: GraphQLString },
    user_email: { type: GraphQLString },
    habits: {
      type: new GraphQLList(HabitType),
      args: { user_id: { type: GraphQLID } },
      resolve(parentValue, args) {
        user_id = 2;
        const query = `SELECT * FROM public.habits WHERE user_id = ${parentValue.user_id}`;
        return db.conn
          .many(query)
          .then(data => {
            if (data.length >= 1) {
              return data;
            } else {
              return null;
            }
          })
          .catch(err => []);
      },
    },
  }),
});

const Me = {
  type: UserType,
  args: {},
  resolve(_, args, { user }) {
    if (!user) {
      throw new Error("You are not logged in...");
      return null;
    }
    const query = `SELECT * FROM public.users WHERE user_id = ${user.user_id}`;
    return db.conn
      .one(query)
      .then(data => data)
      .catch(err => err);
  },
};

const User = {
  type: UserType,
  args: {
    user_id: { type: GraphQLID },
  },
  resolve(_, args) {
    const query = `SELECT * FROM public.users WHERE user_id = ${args.user_id}`;
    return db.conn
      .one(query)
      .then(data => data)
      .catch(err => err);
  },
};

const AllUsers = {
  type: new GraphQLList(UserType),
  args: { userid: { type: GraphQLID } },
  resolve(args) {
    const query = `SELECT * FROM public.users ORDER BY user_id ASC`;
    return db.conn
      .many(query)
      .then(data => {
        return data;
      })
      .catch(err => err);
  },
};

module.exports = {
  UserType,
  HabitType,
  AllUsers,
  User,
  Me,
};
