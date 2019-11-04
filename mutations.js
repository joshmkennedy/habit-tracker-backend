const graphql = require("graphql");
const jsonwebtoken = require("jsonwebtoken");
const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLBoolean,
  GraphQLList,
  GraphQLSchema,
} = graphql;
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);

const { db } = require("./db-connection");

const { UserType, HabitType } = require("./queries");

const SignUp = {
  type: UserType,
  args: {
    user_name: { type: GraphQLString },
    user_password: { type: GraphQLString },
    user_email: { type: GraphQLString },
  },
  resolve(_, args) {
    const username = args.user_name.replace(/\"/g, "");

    const email = args.user_email.replace(/\"/g, "");
    const password = args.user_password.replace(/\"/g, "");
    const hashedPassword = bcrypt.hashSync(password, salt);

    const mutation = `INSERT INTO public.users (user_name, user_email, user_password) VALUES ('${username}', '${email}' ,'${hashedPassword}') RETURNING *`;
    return db.conn
      .one(mutation)

      .then(data => {
        const { user_name, user_id, user_password, user_email } = data;
        const token = jsonwebtoken.sign(
          { user_id, user_name, user_password, user_email },
          "QWERTYQWERTY",
          {
            expiresIn: "365d",
          }
        );
        return { ...data, token };
      })
      .catch(err => err);
  },
};

const DeleteUser = {
  type: UserType,
  args: { user_id: { type: GraphQLID } },
  resolve(_, args) {
    const mutation = `DELETE FROM public.users WHERE user_id = ${args.user_id}
        RETURNING *`;

    return db.conn
      .one(mutation)
      .then(data => {
        return data;
      })
      .catch(err => err);
  },
};

const UpdateUser = {
  type: UserType,
  args: {
    user_id: { type: GraphQLID },
    user_name: { type: GraphQLString },
  },
  resolve(_, args) {
    const mutateName = `UPDATE public.users SET user_name = '${args.user_name}'  WHERE user_id = ${args.user_id}
        RETURNING *`;

    return db.conn
      .one(mutateName)
      .then(data => {
        return data;
      })
      .catch(err => err);
  },
};

const CreateHabit = {
  type: HabitType,
  args: {
    habit_name: { type: GraphQLString },
    habit_should_remind: { type: GraphQLBoolean },
    habit_reoccur_time: { type: GraphQLString },
  },
  resolve(_, args, { user }) {
    const timestamp = new Date().getTime();
    const mutation = `INSERT INTO public.habits (
        habit_name
      , user_id
      , habit_created_at
      , habit_should_remind
      , habit_reoccur_time
      ) VALUES (
        '${args.habit_name}'
      , ${user.user_id}
      , ${timestamp}
      , ${args.habit_should_remind}
      , '${args.habit_reoccur_time}'
      ) RETURNING *`;
    return db.conn
      .one(mutation)
      .then(data => {
        console.log(args);
        return data;
      })
      .catch(err => {
        console.log({ args, err });
        return err;
      });
  },
};

const UpdateHabit = {
  type: HabitType,
  args: {
    habit_id: { type: GraphQLID },
    habit_name: { type: GraphQLString },
    habit_should_remind: { type: GraphQLBoolean },
    habit_reoccur_time: { type: GraphQLString },
  },
  resolve(_, args) {
    const mutation = `UPDATE public.habits 
    SET 
      habit_name = '${args.habit_name}'
      , habit_reoccur_time = '${args.habit_reoccur_time}'
      , habit_should_remind = '${args.habit_should_remind}'
    WHERE habit_id = ${args.habit_id}
    RETURNING *`;
    return db.conn
      .one(mutation)
      .then(data => data)
      .catch(err => err);
  },
};

const DeleteHabit = {
  type: HabitType,
  args: { habit_id: { type: GraphQLID } },
  resolve(_, args) {
    const mutation_two = `DELETE FROM public.habits WHERE habit_id = ${args.habit_id}
        RETURNING *`;
    return db.conn
      .one(mutation_two)
      .then(data => {
        return data;
      })
      .catch(err => args.habit_id);
  },
};

const CompleteAHabit = {
  type: HabitType,
  args: {
    habit_id: { type: GraphQLID },
  },
  resolve(_, args) {
    const mutation = `INSERT INTO public.time_completed (
    "time",
     habit_id
    ) VALUES (
      now(),
      ${args.habit_id}
    )
    RETURNING * 
    `;
    return db.conn
      .one(mutation)
      .then(data =>
        db.conn
          .one(`SELECT * FROM public.habits WHERE habit_id = ${args.habit_id}`)
          .then(data => data)
          .catch(er => er)
      )
      .catch(err => err);
  },
};

const Login = {
  type: GraphQLString,
  args: {
    user_email: { type: GraphQLString },
    user_password: { type: GraphQLString },
  },
  resolve(_, args) {
    const password = args.user_password.replace(/\"/g, "");
    const hashedPassword = bcrypt.hashSync(password, salt);
    console.log(hashedPassword);
    const query = `SELECT * FROM public.users WHERE user_email = '${args.user_email}'
`;
    return db.conn
      .one(query)
      .then(({ user_id, user_name, user_password, user_email }) => {
        if (bcrypt.compareSync(password, user_password)) {
          const token = jsonwebtoken.sign(
            { user_id, user_name, user_password, user_email },
            "QWERTYQWERTY",
            {
              expiresIn: "365d",
            }
          );
          console.log(token);
          return token;
        } else {
          return "oops";
        }
      })
      .catch(err => err);
  },
};

module.exports = {
  UpdateUser,
  DeleteUser,

  SignUp,
  Login,

  CreateHabit,
  UpdateHabit,
  DeleteHabit,
  CompleteAHabit,
};
