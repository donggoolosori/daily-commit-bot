const { GraphQLClient } = require('graphql-request');
const dotenv = require('dotenv');

dotenv.config();

const endpoint = 'https://api.github.com/graphql';

const graphQLClient = new GraphQLClient(endpoint, {
  headers: {
    authorization: `Token ${process.env.GITHUB_TOKEN}`,
  },
});

module.exports = graphQLClient;
