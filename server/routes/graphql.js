const { graphqlExpress } = require('apollo-server-express');
const { makeExecutableSchema, mergeSchemas } = require('graphql-tools');
const { transpileSchema } = require('graphql-s2s').graphqls2s;
const login = require('./graphql_login');
const profile = require('./graphql_score');

const schema = makeExecutableSchema({
  typeDefs: transpileSchema(login.typeDefs) + transpileSchema(profile.typeDefs),
  resolvers: {
    Query: { ...login.resolvers.Query, ...profile.resolvers.Query },
    Mutation: { ...login.resolvers.Mutation, ...profile.resolvers.Mutation }
  },
});

module.exports = graphqlExpress(req => {
  return { schema, context: req }
});