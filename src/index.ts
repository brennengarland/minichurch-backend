import { ApolloServer } from '@apollo/server';
import { DateTypeDefinition } from 'graphql-scalars'
import { MealInput, PersonInput, peopleDatabase, mealsDatabase } from './notion/backend';
import { isFullPage } from '@notionhq/client';
import express from 'express';
import http from 'http';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import cors from 'cors';
import pkg from 'body-parser';
import { expressMiddleware } from '@apollo/server/express4';
import dotenv from "dotenv";
dotenv.config()


const {json} = pkg;


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
    ENTREE
    SIDE
    DESSERT
  }

  type Meal {
    _id: String
    name: String
    course: Course
    date: Date
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

  input PersonInput {
    name: String,
    email: String,
    phoneNumber: String,
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
    createPerson(person: PersonInput): Person
  }
`;

const typeDefs = [
    DateTypeDefinition,
    customTypeDefs
]

const resolvers = {
    Query: {
        people: async () => {
          const data = await peopleDatabase.query();
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
        meals: async () => {
          console.log("Query called!")
          const data = await mealsDatabase.query();
          console.log(data)
          return data.results.map(page => {
            console.log(page)
            if(isFullPage(page)) {
              console.log(page.properties)
              return {
                _id: page.id,
                // @ts-ignore
                name: page.properties['Meal Name'].title[0].plain_text,
                // @ts-ignore
                course: page.properties.Category.select.name,
                // @ts-ignore
                date: page.properties.Date.date.start
              }
            }
          })
        }
      },
    Mutation: {
      createMeal: async (_: any,{ meal }: {meal: MealInput}) => {
        let { date, ...otherProps } = meal;
        date = meal.date.split('T')[0]
        const newMeal = await mealsDatabase.create({date, ...otherProps});
        return isFullPage(newMeal)
      },
      createPerson: async (_: any, { person }: {person: PersonInput }) => {
        const newPerson = await peopleDatabase.create(person);
        if(isFullPage(newPerson)) {
          return {
            _id: newPerson.id,
            // @ts-ignore
            name: newPerson.properties.Name.title[0].plain_text,
            // @ts-ignore
            email: newPerson.properties.Email.email,
            // @ts-ignore
            phone: newPerson.properties.Phone.phone_number,
          }

        }
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
async function startApolloServer() {
  const server = new ApolloServer<MyContext>({
      typeDefs,
      resolvers,
      plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    });

  await server.start();

  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    json(),
    expressMiddleware(server),
    );

  await new Promise<void>(resolve => httpServer.listen({ port: process.env.PORT || 4000 }, resolve));
  console.log(`🚀 Server ready at http://localhost:4000/`);
}

startApolloServer();
