const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const depthLimit = require("graphql-depth-limit");

const typeDefs = `
  type Query {
    posts: [Post]
    post(id: ID!): Post
  }

  type Post {
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

const schema = makeExecutableSchema({ typeDefs, resolvers });

const app = express();

app.use(
  "/graphql",
  graphqlHTTP((req, res) => ({
    schema,
    graphiql: true,
    validationRules: [
      depthLimit(7),
    ],
  }))
);

app.listen(1709, () => {
  console.log(`Server listening on http://localhost:1709/graphql`);
});