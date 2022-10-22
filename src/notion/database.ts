import { MealInput, notion, PersonInput } from "./backend"

export class PeopleDatabase {
    _id = "91d1c692f46c4cff96d1d43b460bccea";
    _notion = notion;

    query(filter?: any) {
        const query = notion.databases.query({
            database_id: this._id,
            filter: filter
        });
        console.log(query)
        return query;
    }

    create(page: PersonInput) {
        console.log(page)
        return notion.pages.create({
            parent: {
                type: "database_id",
                database_id: this._id
            },
            properties: {
                'Name': {
                    title: [
                        {
                            text: {
                                content: page.name
                            }
                        }
                    ]
                },
                Email: {
                    email: page.email
                },
                Phone: {
                    phone_number: page.phoneNumber
                }
            }
        })
    }
}

export class MealDatabase {
    _id = "84e2850b0f48437d945b4993cb824af4";
    _notion = notion;

    query() {
        console.log(new Date().toISOString())
        const query = notion.databases.query({
            database_id: this._id,
            filter: {
                property: "Date",
                date: {
                    on_or_after: new Date().toISOString()
                }
            }
        });
        console.log(query)
        return query;
    }

    create(page: MealInput) {
        console.log(page)
        return notion.pages.create({
            parent: {
                type: "database_id",
                database_id: this._id
            },
            properties: {
                'Meal Name': {
                    title: [
                        {
                            text: {
                                content: page.name
                            }
                        }
                    ]
                },
                Date: {
                    date: {
                        start: page.date
                    }
                },
                Category: {
                    select: {
                        name: page.category.toString()
                    }
                },
                People: {
                    relation: page.people
                }
            }
        })
    }
}