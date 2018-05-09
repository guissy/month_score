const { graphqlExpress } = require('apollo-server-express');
const { makeExecutableSchema, mergeSchemas } = require('graphql-tools')
const login = require('./graphql_login');
const profile = require('./graphql_score');

const schema = makeExecutableSchema({
  typeDefs: login.typeDefs + profile.typeDefs,
  resolvers: {
    Query: { ...login.resolvers.Query, ...profile.resolvers.Query },
    Mutation: { ...login.resolvers.Mutation, ...profile.resolvers.Mutation }
  },
});
// const schema = mergeSchemas(login, profile)

module.exports = graphqlExpress(req => {
  return { schema, context: req }
});