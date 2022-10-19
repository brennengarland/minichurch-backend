import { notion } from "./backend"
import { CreatePageParameters } from "@notionhq/client/build/src/api-endpoints";

export default class Database<T, InputType> {
    id: string;
    notion = notion;
    constructor(id: string) {
        this.id = id;
    }

    query(filter?: any) {
        const query = notion.databases.query({
            database_id: this.id,
            filter: filter
        });
        console.log(query)
        return query;
    }

    create(page: InputType) {
        console.log(page)
        return notion.pages.create({
            parent: {
                type: "database_id",
                database_id: this.id
            },
            properties: {
                "Meal Name": {
                    // @ts-ignore
                    title: [
                        {
                            "type": "text",
                            "text": {
                                // @ts-ignore
                              "content": page.name
                            }
                        }
                    ]
                },
                Date: {
                    // @ts-ignore
                    date: {
                        // @ts-ignore
                        start: page.date
                    }
                },
                Category: {
                    // @ts-ignore
                    select: {
                        // @ts-ignore
                        name: page.category
                    }
                },
                People: {
                    // @ts-ignore
                    relation: page.people
                }
            }
        })
    }
}