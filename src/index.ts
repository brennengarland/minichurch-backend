import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { DateTypeDefinition } from 'graphql-scalars'
import { MealsDatabase, page, PeopleDatabase, MealInput } from './notion/backend';
import { isFullPage } from '@notionhq/client';
import express from 'express';
import http from 'http';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import cors from 'cors';
import bodyParser from 'body-parser';
import { expressMiddleware } from '@apollo/server/express4';


// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const customTypeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.
    
  # This "Book" type defines the queryable fields for every book in our data source.
  type Person {
    _id: String
    name: String
    email: String
    phone: String
  }

  enum Course {
    ENTREE,
    SIDE,
    DESSERT
  }

  type Meal {
    _id: String
    name: String
    category: Course
    date: Date
    person: [Person]
  }

  input PeopleReference {
    id: String
  }

  input MealInput {
    name: String
    category: Course
    date: Date
    people: [PeopleReference]
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    people: [Person]
    meals: [Meal]
  }

  type Mutation {
    createMeal(meal: MealInput): Boolean
  }
`;

const typeDefs = [
    DateTypeDefinition,
    customTypeDefs
]

const resolvers = {
    Query: {
        people: async () => {
          const data = await PeopleDatabase.query();
          return data.results.map(page => {
            if(isFullPage(page)) {
              return {
                _id: page.id,
                // @ts-ignore
                name: page.properties.Name.title[0].plain_text,
                // @ts-ignore
                email: page.properties.Email.email,
                // @ts-ignore
                phone: page.properties.Phone.phone_number,
              }
            }
          })
        },
      },
    Mutation: {
      createMeal: async (_,{ meal }: {meal: MealInput}) => {
        console.log(meal)
        const newMeal = await MealsDatabase.create(meal);
        return isFullPage(newMeal)
      }
    }
}

interface MyContext {
  token?: String;
}

const app = express();
const httpServer = http.createServer(app);


// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer<MyContext>({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

await server.start();

app.use('/',
  cors<cors.CorsRequest>(),
  bodyParser.json(),
  // expressMiddleware accepts the same arguments:
  // an Apollo Server instance and optional configuration options
  expressMiddleware(server, {
    context: async ({ req }) => ({ token: req.headers.token }),
  }),
  );

await new Promise<void>(resolve => httpServer.listen({ port: 4000 }, resolve));
console.log(`🚀 Server ready at http://localhost:4000/`);