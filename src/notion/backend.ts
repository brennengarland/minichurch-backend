import { Client } from "@notionhq/client";
import dotenv from "dotenv";
import { MealDatabase, PeopleDatabase } from "./database";

const MEALS_URL = "https://www.notion.so/mini-church/84e2850b0f48437d945b4993cb824af4?v=ef05198e89af4e949bccc722740d06b5";
const MEALS_DATABASE_ID = "84e2850b0f48437d945b4993cb824af4";
const PEOPLE_URL = "https://www.notion.so/mini-church/91d1c692f46c4cff96d1d43b460bccea?v=b7601c4cd5b24076b54faeb054e68f25";
const PEOPLE_DATABASE_ID = "91d1c692f46c4cff96d1d43b460bccea";
dotenv.config()

export interface Person {
  id: string,
  name: string,
  email: string,
  phoneNumber: string
  meals: {id: string}[]
}

export interface PersonInput {
  name: string,
  email: string,
  phoneNumber: string
}

export enum Course {
  Entree,
  Side,
  Dessert
}

export interface Meal {
  id: string,
  title: string,
  date: Date,
  course: Course,
  people: {id: string}[]
}

export interface MealInput {
  name: string
  category: Course
  date: string
  people: {id: string}[]
}


export const notion = new Client({
    auth: process.env.NOTION_TOKEN,
  });

export const peopleDatabase = new PeopleDatabase();
export const mealsDatabase = new MealDatabase();

export const people = () => peopleDatabase.query()
export const page = (id: string) => notion.pages.retrieve({ page_id: id });