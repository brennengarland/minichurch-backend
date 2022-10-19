import { Client } from "@notionhq/client";
import dotenv from "dotenv";
import { Database } from "./database";
const MEALS_URL = "https://www.notion.so/mini-church/84e2850b0f48437d945b4993cb824af4?v=ef05198e89af4e949bccc722740d06b5";
const MEALS_DATABASE_ID = "84e2850b0f48437d945b4993cb824af4";
const PEOPLE_URL = "https://www.notion.so/mini-church/91d1c692f46c4cff96d1d43b460bccea?v=b7601c4cd5b24076b54faeb054e68f25";
const PEOPLE_DATABASE_ID = "91d1c692f46c4cff96d1d43b460bccea";
dotenv.config();
export var Course;
(function (Course) {
    Course[Course["Entree"] = 0] = "Entree";
    Course[Course["Side"] = 1] = "Side";
    Course[Course["Dessert"] = 2] = "Dessert";
})(Course || (Course = {}));
export const notion = new Client({
    auth: process.env.NOTION_TOKEN,
});
export const PeopleDatabase = new Database(PEOPLE_DATABASE_ID);
export const MealsDatabase = new Database(MEALS_DATABASE_ID);
export const people = () => PeopleDatabase.query();
export const page = (id) => notion.pages.retrieve({ page_id: id });
