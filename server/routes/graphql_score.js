const { Model } = require('mongorito');

const mongodb = require('./mongodb');
const { resultErr, resultOk } = require('./result');

class Score extends Model {}
mongodb.register(Score);

module.exports = {
  Score,
  typeDefs: `
    type ScoreItem {
      rateBoss: Int
      rateSelf: Int
      about: String
      levelBoss: String
      levelSelf: String
    }

    type Score {
      hard: ScoreItem!
      speed: ScoreItem!
      reactive: ScoreItem!
      test: ScoreItem!
      quality: ScoreItem!
      grow: ScoreItem!
      team: ScoreItem!
      meeting: ScoreItem!
      id: ID!
      uid: Int!
      job: String
      part: String
      parent: String
      date: String!
      dateType: String!
      createdTime: String
      finishBoss: Boolean
      finishSelf: Boolean
      truename: String!
    }
    
    input ScoreItemInput {
      rateBoss: Int
      rateSelf: Int
      about: String
      levelBoss: String
      levelSelf: String
    }
    input ScoreInput {
      hard: ScoreItemInput!
      speed: ScoreItemInput!
      reactive: ScoreItemInput!
      test: ScoreItemInput!
      quality: ScoreItemInput!
      grow: ScoreItemInput!
      team: ScoreItemInput!
      meeting: ScoreItemInput!
    
      uid: Int!
      truename: String
      job: String
      part: String
      parent: String
      date: String!
      dateType: String!
      createdTime: String
      finishBoss: Boolean
      finishSelf: Boolean
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
    type Empty {
      id: Int
    }
    extend type Query {
      list(date: String): ResultList<Score>
      detail(uid: Int!, date: String!): Result<Score>
    }
    extend type Mutation {
      save(score: ScoreInput!): Result<Empty>
      done(uid: Int!, date: String!): Result<Empty>
      delete(uid: Int!, date: String!): Result<Empty>
      export(uid: Int!, date: String!): Result<Empty>
    }
  `,
  resolvers: {
    Query: {
      // 列表
      async list(source, input, req) {
        let result = resultOk();
        const query = req.locals.__username === 'zlg' ? {} : {uid: req.locals.__uid};
        if (input.date) {
          query.date = input.date;
        }
        const scoreListDb = await Score.sort('createdTime', 'desc').find(query);
        if (scoreListDb.length > 0) {
          result.data = scoreListDb.map(score => score.toJSON());
          // console.log('☞☞☞ 9527 graphql_score 102', result.data);
          result.attributes = {
            number: 1,
            current: 1,
            total: result.data.length
          }
        }
        return result;
      },
      // 编辑前获取详情
      async detail(err, input, req) {
        const result = resultOk();
        const sudo = req.locals.__uid === input.uid || req.locals.__username === 'zlg';
        if (!sudo) {
          const err = new Error();
          err.status = 403;
          throw err;
        }
        const scoreDb = await Score.findOne({uid: Number(input.uid), date: input.date});
        if (scoreDb) {
          result.data = scoreDb.toJSON();
        }
        return result;
      },
    },

    Mutation: {
      // 保存
      async save(err, {score: scoreIn}, req) {
        let result = resultErr();
        const scoreDb = await Score.findOne({uid: scoreIn.uid, date: scoreIn.date });
        if (scoreDb) {
          scoreDb.set(scoreIn);
          scoreDb.set('uid', scoreIn.uid);
          scoreDb.save();
          result = resultOk(scoreDb.toJSON());
        } else {
          const score = new Score(scoreIn);
          score.set('createdTime', Date.now());
          score.set('uid', req.locals.__uid);
          scoreDb.set('id', scoreIn.uid + '_' + scoreIn.date);
          score.save();
          result = resultOk(score.toJSON());
        }
        return result;
      },

      // 删除
      async delete(err, input, req) {
        let result = resultErr('找不到该项目');
        const scoreDb = await Score.findOne(input);
        if (scoreDb) {
          scoreDb.remove();
          result = resultOk({});
        }
        return result;
      },

      // 完成
      async done(err, input, req) {
        let result = resultErr('找不到该项目');
        const scoreDb = await Score.findOne({uid: input.uid, date: input.date});
        if (scoreDb) {
          const finish = req.locals.__uid === input.uid ? 'finishSelf' : 'finishBoss';
          scoreDb.set({[finish]: true});
          scoreDb.save();
          result = resultOk({});
        }
        return result;
      }
    },
  }
}
