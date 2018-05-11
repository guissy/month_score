const jwt = require('jsonwebtoken');
const { Model } = require('mongorito');

const mongodb = require('./mongodb');
const { resultErr, resultOk } = require('./result');
const { secretOrPrivateKey } = require('./token');

class Login extends Model {}
mongodb.register(Login);

Login.findOne().then(zlg => {
  if (!zlg) {
    const login = new Login({
      username: 'admin',
      password: 'admin',
      truename: 'admin',
      job: '前端攻城狮',
      part: '技术部',
      id: 1
    });
    login.save();
  }
});

module.exports = {
  Login,
  typeDefs: `
    type User {
      id: Int
      username: String!
      truename: String!
      nick: String!
      logintime: String!
      role: String!
      member_control: String
      email: String!
      mobile: String!
      telephone: String!
      part: String!
      job: String!
      comment: String!
      hasLogin: Boolean
    }
    input UserInput {
      username: String!
      password: String!
      truename: String!
      nick: String
      role: String
      part: String!
      job: String!
      comment: String
    }
    input PasswordInput {
      password: String!
    }
    type Login {
      token: String
      list: User
      role: String
      route: [MenuItem]
      expire: String
    }
    type MenuItem {
      id: Int!
      name: String!
      action: [String!]
      path: String!
      icon: String
      children: [MenuItem]
    }
    type Result<T> {
      state: Int!
      message: String!
      data: T    
    } 
    type ResultList<T> {
      state: Int!
      message: String!
      data: [T]
    }
    type Query {
      all: ResultList<User>
    }
    type Mutation {
      login(username: String!, password: String!): Result<Login>
      logout: Result<Boolean>
      register(user: UserInput!): Result<Boolean>
      password(user: PasswordInput!): Result<Boolean>
    }
  `,
  resolvers: {
    Query: {
      async all() {
        let result = resultErr('Error');
        const loginListDb = await Login.find({});
        if (loginListDb.length > 0) {
          const data = loginListDb.map(login => login.toJSON());
          result = resultOk(data);
        }
        return result;
      },
    },
    Mutation: {
      async login(err, loginIn, req) {
        const loginDb = await Login.findOne(loginIn);
        let result;
        if (!loginDb) {
          result = resultErr("账号或密码不对！");
        } else {
          const username = loginDb.get('username');
          const uid = loginDb.get('id');
          const action = username === 'zlg'
            ? ["delete", "update", "fetch", "insert", 'finish']
            : ["delete", "update", "fetch", "insert", 'finish'];
          req.app.set(username, true);
          const data = {
            token: jwt.sign({
              username: username,
              uid: uid,
            }, secretOrPrivateKey, {
              expiresIn: 60 * 60 * 1000
            }),
            state: 1,
            list: {
              "id": loginDb.get('id'),
              "username": username,
              "truename": loginDb.get('truename'),
              "nick": "anonymity",
              "email": "",
              "telephone": "",
              "mobile": "",
              "part": loginDb.get('part'),
              "job": loginDb.get('job'),
              "comment": "",
              "logintime": "2018-04-18 01:51:51",
              "role": "1"
            },
            "role": "master",
            "route": [
              {
                "id": 0,
                "action": action,
                "path": "\/index",
                "name": "本月考核",
                "children": [
                  {
                    "id": 1,
                    "action": action,
                    "path": "\/list",
                    "name": "考核列表",
                  },
                  {
                    "id": 2,
                    "action": action,
                    "path": "\/month",
                    "name": "考核列表",
                  }
                ]
              }
            ],
            expire: (Date.now() + 60 * 60 * 1000) / 1000
          }
          result = resultOk(data);
        }
        return result;
      },
      async logout(err, loginIn, req) {
        let result = resultErr('Error');
        const loginDb = await Login.findOne(loginIn);
        if (loginDb) {
          req.app.set(req.locals.__username, false);
          const data = {}
          result = resultOk(data);
        }
        return result;
      },
      async password(err, loginIn, req) {
        let result = resultErr('Error');
        const loginDb = await Login.findOne({
          password: loginIn.user.password,
          username: req.locals.__username
        });
        if (loginDb) {
          loginDb.set('password', loginIn.user.password);
          loginDb.save();
          const data = {};
          result = resultOk(data);
        }
        return result;
      },
      async register(err, { user: loginIn }, req) {
        let result;
        const loginDb = await Login.or([
          {username: loginIn.username},
          {truename: loginIn.truename}
        ]).findOne();
        if (loginDb) {
          result = resultErr('用户名已存在');
        } else {
          const loginMax = await Login.sort('id', 'desc').findOne();
          let maxId = loginMax ? loginMax.get('id') : 0;
          const login = new Login(loginIn);
          login.set('id', maxId + 1);
          await login.save();
          result = resultOk({});
        }
        return result;
      }
    },
  },
}

