import { notion } from "./backend";
export class Database {
    constructor(id) {
        this.notion = notion;
        this.id = id;
    }
    query(filter) {
        const query = notion.databases.query({
            database_id: this.id,
            filter: filter
        });
        console.log(query);
        return query;
    }
    create(page) {
        console.log(page);
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
        });
    }
}
