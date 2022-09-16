const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const depthLimit = require("graphql-depth-limit");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { shield } = require('graphql-shield');
const { applyMiddleware } = require('graphql-middleware');
const { createRateLimitRule } = require('graphql-rate-limit');


const typeDefs = `
  type Query {
    posts: [Post] 
    post(id: ID!): Post 
  }
    
  type Post{
    id: ID!
    title: String!
    related: [Post]
  }
`;

const posts = [{ id: "123", title: "Tin Hot" }];

const resolvers = {
  Query: {
    posts: () => posts,
    post: (_, args) => posts.find((post) => post.id === args.id),
  },
  Post: {
    related: () => posts,
  },
};
// Step 1: get rate limit shield instance rule
const rateLimitRule = createRateLimitRule({ identifyContext: (ctx) => ctx.id });

const permissions = shield({
  Query: {
    // Step 2: Apply the rate limit rule instance to the field with config
    posts: rateLimitRule({ window: "60s", max: 5 })
  }
});


const schema = applyMiddleware(makeExecutableSchema({ typeDefs, resolvers }), permissions);

const app = express();


app.use(
  "/graphql",
  graphqlHTTP((req, res) => ({
    schema,
    graphiql: true,
    validationRules: [
      depthLimit(9),
    ],
  }))

);


app.listen(1709, () => {
  console.log(`Server listening on http://localhost:1709/graphql`);
});