const express = require('express');
const express_graphql = require('express-graphql');
const { buildSchema } = require('graphql');

// Schema
let schema = buildSchema(`
    type Library {
        id: ID
        name: String
        books: [Book]
    }
    type Book {
        id: ID
        title: String
        number: Int
        author: Author
    }
    type Author {
        id: ID
        firstname: String
        lastname: String
    }
    type Query {
        library(libraryId: Int!): Library
        libraries: [Library]
        books: [Book]
        authors: [Author]
    }
    type Mutation {
        createLibrary(name: String!): Library
        createBook(title: String!, number: Int!, authorId: Int!): Book
        createAuthor(firstname: String!, lastname: String!): Author
        linkBook(libraryId: Int!, bookId: Int!): Library
    }
`);

// Identifiers
let libraryId = 0;
let bookId = 0;
let authorId = 0;

// Providers
let providers = {
    libraries: [],
    books: [],
    authors: []
}

// Resolvers
let resolvers = {

    // Queries
    library(params) {
        return providers.libraries.find(element => element.id == params.libraryId);
    },
    libraries() {
        return providers.libraries;
    },
    books() {
        return providers.books;
    },
    authors() {
        return providers.authors;
    },

    // Mutations
    createLibrary(params) {
        let library = {
            id: libraryId++,
            name: params.name,
            books: []
        }
        providers.libraries.push(library);
        return library;
    },
    createBook(params) {
        let author = providers.authors.find(element => element.id == params.authorId);
        let book = {
            id: bookId++,
            title: params.title,
            number: params.number,
            author: author
        }
        providers.books.push(book);
        return book;
    },
    createAuthor(params) {
        let author = {
            id: authorId++,
            firstname: params.firstname,
            lastname: params.lastname
        }
        providers.authors.push(author);
        return author;
    },
    linkBook(params) {
        let book = providers.books.find(element => element.id == params.bookId);
        let library = null;
        providers.libraries.forEach(element => {
            if(element.id == params.libraryId) {
                element.books.push(book);
                library = element;
                return;
            }
        });
        return library;
    }
};

// Express
let app = express();
app.use('/graphql', express_graphql({
    schema: schema,
    rootValue: resolvers,
    graphiql: true
}));

app.listen(3000, () => console.log('Express running on port 3000'));