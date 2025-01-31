---
layout: "../../layouts/MarkdownLayout.astro"
title: How to implement a simple backend application with NodeJS and Typescript?
author: Guilherme Nascimento
description: "After learning some Astro, I couldn't stop!"
pubDate: 2025-01-27
tags: ["astro", "blogging", "learning in public", "successes"]
---

## Introduction

### What can you expect on this blog post?

After reading this blog post, you will be able to develop restful API's using typescript and express that will be connected to database and using typeORM as an ORM tool.
Beyond that you will have the knowledge to help you organize your projects and handle errors, implementing logs, set up your config files,environment variables and use docker to containerize your application.

### Prerequisites

It's not a rule, but I believe you will take more of this blog post if you have a basic knowledge of:

- Javascript / Typescript
- What is an API
- REST principles

Just remembering is not mandatory, I will briefly cover these topics during the post

### Why am I using Node and express for this?

Well, simply answering that, I'm just curious about it :)

As the moment I wrote this post, I work with the .NET ecosystem on the back end and with react and typescript on the front end, and i was wondering how would it be to deal with typescript/javascript on the back end too, that's why i picked these two technologies :)

I'm sorry if you were expecting something more "beautiful"

## Core concepts

### What is NodeJS and Express?

NodeJS is javascript runtime that enables run javascript outside of the browser. It was built on Chrome's V8 javascript engine and since it was built on the V8 engine, the Javascript code is directly compiled into machine code, you can check more about it [here](https://www.freecodecamp.org/news/how-javascript-works-behind-the-scenes/) ([doc](https://nodejs.org/en))

Express is a framework for built web applications with NodeJs
([doc](https://expressjs.com/))

### What is a typescript and why use it?

Typescript is a [superset](https://www.epicweb.dev/what-is-a-superset-in-programming) of javascript developed by Microsoft. It adds syntax on top javascript, allowing adding types to javascript.

The use of typescript during the development of your application can ensure type safety, improve code maintainability and you can detect more errors easily.

### RESTful APIs

API is an acronym for Application Programming Interface that is used in the communication between servers and services.

A RESTful API is an API that follows the [REST](https://restfulapi.net/) principles, here are some of these principles:

- Cacheable
- Stateless
- Use of URI
- Use of HTTP verbs

### What is an ORM and typeORM?

An ORM, or Object Relational Mapper, is a database tool to help identify and translate the database models used on relational databases to OO models used on client applications, and typeOrm is just one of these tools.

## Core concepts

### Initial setup

To start our project:

```ts
npm init -y
```

And then install some dependencies for this initial setup:

```ts
npm install typeorm --save
npm install reflect-metadata --save
npm install @types/node --save-dev
npm install pg --save
```

Or

```ts

npx typeorm init --name MyProject --database postgres

```

With this, we will have an initial structure on our application, but I felt more comfortable adding some other folders and files that I will cover now, but before it you will need those dependencies

```ts
npm i winston
npm i dotenv
```

Here we have some configuration files where I put some configuration and logging file:

```ts
//src/config/config.ts
import dotenv from "dotenv";

dotenv.config();

// Environment flags
export const ENV = {
  DEVELOPMENT: process.env.NODE_ENV === "development",
  TEST: process.env.NODE_ENV === "test",
};

// Server configuration
export const SERVER = {
  HOSTNAME: process.env.SERVER_HOSTNAME || "localhost",
  PORT: process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 1337,
};

// Database configuration
export const DATABASE = {
  HOST: process.env.DB_HOST || "localhost",
  PORT: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  USERNAME: process.env.DB_USERNAME || "postgres",
  PASSWORD: process.env.DB_PASSWORD || "postgres",
  NAME: process.env.DB_DATABASE || "localdb",
};
```

---

```ts
//src/config/logger.ts
import winston from "winston";
const { combine, timestamp, printf, colorize } = winston.format;
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6,
};
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
};
winston.addColors(colors);
const logger = winston.createLogger({
  levels: logLevels,
  format: combine(
    timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    colorize(),
    winston.format.printf(({ level, message, timestamp }) => {
      return `${timestamp} [${level}]: ${message}`;
    }),
  ),
  transports: [new winston.transports.Console()],
});

export default logger;
```

### Why do we need those files?

For mainly two reasons:

1. It's easier to set the environment variables and configs when you have a centralized file
2. It's useful when get track of what it's happening on some process on our application. Believe in me when I say that logging can save you from a LOT of work, if corrected configured. On this application we will use [winston](https://github.com/winstonjs/winston)

In this application, we are gonna use those environment variables to configure our database

### Database Layer

### Dealing with entities

Before setting up our data-source.ts file we are gonna need to create our entities, but you may ask, what are those entities?
Basically are the classes that contain our business logic and attributes that we may use on our application that will be mapped on our Database tables.
On this application we will use the Book as an entity to do operations

Create an entities folder and put the book.ts inside of it:

```ts
// src/entities/Book.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 50 })
  author: string;

  @Column({ type: "varchar", length: 100 })
  title: string;

  @CreateDateColumn()
  publishedAt: Date;
}
```

To make your entities available for being used to create a database you will need to use some decorators offered by TypeORM.

Above is a simple implementation of some model that became an entity for our database using Primary key decorator, column and for date column.

If you want to get know more about it, check their [documentation](https://typeorm.io/)

> CHECK THE INTERFACE STEP AND THE OTHER DOCUMENTATION

### TypeORM setup

For configuring our TypeORM, we are gonna move the config of the data-source.ts file into database folder and keep it like that:

```ts
// src/database/data-source.ts
import "reflect-metadata";
import { DataSource } from "typeorm";
import { DATABASE } from "../config/config";
import { Book } from "../entities/Book";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: DATABASE.HOST,
  port: DATABASE.PORT,
  username: DATABASE.USERNAME,
  password: DATABASE.PASSWORD,
  database: DATABASE.NAME,
  synchronize: true,
  logging: false,
  entities: [Book],
  migrations: [],
  subscribers: [],
});
```

### Migrations

Need to check the video to discover which command for setup the migrations of the database

### Repository and DTOs

Putting in simple words, a repository is a way to handle operations with the respective entities that you have, in our case, the Book entity

And the structure of the repository should look like this:

```ts
// src/repositories/BookRepository.ts
import { Repository } from "typeorm";
import { AppDataSource } from "../database/data-source";
import { Book } from "../entities/Book";
import { IBook } from "../interfaces/IBook";
import { BookDTO } from "../dtos/book/insert-book-dto";
import { NotFoundException } from "../exceptions/NotFoundException";

class BookRepository {
  private repository: Repository<Book>;

  constructor() {
    this.repository = AppDataSource.getRepository(Book);
  }

  async getBooks(): Promise<IBook[]> {
    return await this.repository.find();
  }

  async getBookById(id: number): Promise<IBook> {
    const book = await this.repository.findOneBy({
      id,
    });
    if (!book) {
      throw new NotFoundException(`Book with id ${id} not found`);
    }
    return book;
  }

  async createBook(bookDto: BookDTO): Promise<IBook> {
    const book = this.repository.create({ ...bookDto });
    return await this.repository.save(book);
  }

  async updateBook(id: number, bookDto: BookDTO): Promise<IBook> {
    const book = await this.getBookById(id);
    this.repository.merge(book, bookDto);
    return await this.repository.save(book);
  }

  async deleteBook(id: number): Promise<void> {
    const book = await this.getBookById(id);
    await this.repository.remove(book);
  }
}

export default new BookRepository();
```

Beyond it implementation i would like highlight some points:

- The use of a DTO
- Use of a custom exception

We use the DTO (Data transfer object) to transfer data between layers of our application, in this case we will use the bookDto to receive the information of the book we want to do some operation from the controllers, that we will cover lately.

CHECK IF NECESSARY TO USE CLASS-TRANSFORMER

```ts
// src/dtos/book/insert-book-dto.ts;
import { Expose } from "class-transformer";
export class BookDTO {
  @Expose()
  title: string;

  @Expose()
  author: string;
}
```

About the custom exception, I believe it's easier to debug and can improve the error handling in our application. But just to know, we will talk specifically about errorHandlers and how we can implement them.

```ts
// src/exceptions/NotFoundException.ts;
export class NotFoundException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundException";
  }
}
```

## API Implementation

### Organizing controllers and their routes

If you are don't know what controllers are, they are the entry points for external applications to communicate with ours, its through them and their URI that we will know what action or resource is being requested.

Before showing the implementation of our controller, we have the use of schemas, that are basically a model that defines the structure and validation rules for data, in this case our request body:

```ts
// src/schemas/index.ts
import Joi from "joi";

export const bookSchema = {
  idSchema: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),

  createSchema: Joi.object({
    title: Joi.string().required(),
    author: Joi.string().required(),
  }),

  updateSchema: Joi.object({
    title: Joi.string(),
    author: Joi.string(),
  }),
};
```

Now we can run into our controller:

```ts
// src/controllers/bookController.ts
import { Router, Request, Response, NextFunction } from "express";
import { bookSchema } from "../schemas";
import BookRepository from "../repositories/BookRepository";
import { BookDTO } from "../dtos/book/insert-book-dto";

const baseRoute = "/book";
export const bookRouter = Router();

bookRouter.post(
  `${baseRoute}/insertBook`,
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { error } = bookSchema.createSchema.validate(request.body, {
        abortEarly: false,
      });

      if (error) {
        response.status(400).json({
          status: "error",
          message: "Validation failed",
          errors: error.details.map((err) => err.message),
        });
      }

      const res = await BookRepository.createBook(request.body);
      response
        .status(200)
        .json({ payload: request.body, responseFromRepo: res });
    } catch (error) {
      next(error);
    }
  },
);

bookRouter.get(
  `${baseRoute}/getBooks`,
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const res = await BookRepository.getBooks();
      response.status(200).json(res);
    } catch (error) {
      next(error);
    }
  },
);

bookRouter.put(
  `${baseRoute}/editBook/:bookId`,
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      console.log(Number(request.params.bookId));
      const paramsValidation = bookSchema.idSchema.validate(
        { id: Number(request.params.bookId) },
        {
          abortEarly: false,
        },
      );

      if (paramsValidation.error) {
        response.status(400).json({
          status: "error",
          message: "Validation failed on the id",
          errors: paramsValidation.error.details.map((err) => err.message),
        });
      }

      const bodyValidation = bookSchema.updateSchema.validate(request.body, {
        abortEarly: false,
      });

      if (bodyValidation.error) {
        response.status(400).json({
          status: "error",
          message: "Validation failed",
          errors: bodyValidation.error.details.map((err) => err.message),
        });
      }

      const bookId = Number(request.params.bookId);
      const bookDto: BookDTO = request.body;
      const updatedBook = await BookRepository.updateBook(bookId, bookDto);
      response.status(200).json(updatedBook);
    } catch (error) {
      next(error);
    }
  },
);

bookRouter.delete(
  `${baseRoute}/:bookId`,
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { error } = bookSchema.idSchema.validate(
        { id: Number(request.params.bookId) },
        {
          abortEarly: false,
        },
      );

      if (error) {
        response.status(400).json({
          status: "error",
          message: "Validation failed",
          errors: error.details.map((err) => err.message),
        });
      }

      const bookId = Number(request.params.bookId);
      await BookRepository.deleteBook(bookId);
      response.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);
```

Some notes about it:

- We get the errors from the validation with our schema
- We use the `next` on the catch error instead of throwing a new Error in order to use a middleware that we are gonna create to handle errors in our application
- We use our repository to interact with the database

### The use of middlewares

Middlewares are functions that runs between receiving a request and sending a response in web application.
In our application we have 4 middlewares:

- corsHandler : Handles Cross-Origin Resource Sharing (CORS) by setting appropriate headers to allow cross-origin requests

```ts
// src/middleware/corsHandler.ts
import { Request, Response, NextFunction } from "express";

export function corsHandler(req: Request, res: Response, next: NextFunction) {
  res.header("Access-Control-Allow-Origin", req.header("origin"));
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  );
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    res.status(200).json({});
    return;
  }

  next();
}
```

- ErrorHandler: Processes errors, logs them, and sends error responses to clients

```ts
// src/middleware/errorHandler.ts

import { Request, Response, NextFunction } from "express";
import { HttpException } from "../exceptions/HttpException";
import logger from "../config/logger";

export const errorHandler = (
  error: HttpException,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const status = error.status || 500;
  const message = error.message || "Something went wrong";

  logger.error(
    `[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`,
  );

  res.status(status).json({ message });
};
```

- LoggingHandler: Logs information about incoming requests and their results

```ts
// src/middleware/loggingHandler.ts
import { Request, Response, NextFunction } from "express";
import logger from "../config/logger";

export function loggingHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  logger.info(
    `Incomming - METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`,
  );

  res.on("finish", () => {
    logger.info(
      `Result - METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}] - STATUS: [${res.statusCode}]`,
    );
  });

  next();
}
```

- RouteNotFound: Handles cases when a requested route doesn't exist (404 errors)

```ts
// src/middleware/routeNotFound.ts
import { Request, Response, NextFunction } from "express";
import logger from "../config/logger";

export function routeNotFound(req: Request, res: Response, next: NextFunction) {
  const error = new Error("Not found");
  logger.warn(error);

  res.status(404).json({
    error: {
      message: error.message,
    },
  });
  return;
}
```

We use those middlewares to help in "repetitive" tasks/problems that may happen in other parts of our application as it grows.

### Server config

For implementing all the configurations we prepared, here we have our server.ts file, the one which will start our server:

```ts
// src/server.ts
import http from "http";
import express from "express";
import logger from "./config/logger";
import { loggingHandler } from "./middleware/loggingHandler";
import { corsHandler } from "./middleware/corsHandler";
import { routeNotFound } from "./middleware/routeNotFound";
import { SERVER } from "./config/config";
import { AppDataSource } from "./database/data-source";
import routers from "./routes/bookRoutes";
import { errorHandler } from "./middleware/errorHandler";

export const application = express();
export let httpServer: http.Server;

export const Main = async () => {
  logger.info("-----------------------");
  logger.info("Initializing API");
  logger.info("-----------------------");

  application.use(express.urlencoded({ extended: true }));
  application.use(express.json());

  logger.info("-----------------------");
  logger.info("Logging and configuration");
  logger.info("-----------------------");

  application.use(loggingHandler);
  application.use(corsHandler);

  logger.info("-----------------------");
  logger.info("Controller routing");
  logger.info("-----------------------");

  application.get("/main/healthcheck", (req, res) => {
    res.status(200).json({ hello: "world!" });
  });

  application.use(routers);
  application.use(routeNotFound);
  application.use(errorHandler);

  httpServer = http.createServer(application);

  httpServer.listen(SERVER.PORT, SERVER.HOSTNAME, () => {
    logger.info(`Server running at http://${SERVER.HOSTNAME}:${SERVER.PORT}`);
  });

  await AppDataSource.initialize();
  logger.info("Database connected!");
};

export const Shutdown = async () => {
  if (httpServer) {
    return new Promise<void>((resolve) => {
      httpServer.close(async () => {
        if (AppDataSource.isInitialized) {
          await AppDataSource.destroy();
        }
        resolve();
      });
    });
  }
};

if (require.main === module) {
  Main().catch((error) => {
    logger.error("Failed to start server:", error);
  });
}
```

## Testing

Why testing a simple application, you may ask? Well, I believe start writing tests can help you to prevent bugs in your application, reduce manual tasks/testing endpoints and also improve your code in order to become more easy to test it

For this application, we are gonna write integration tests, that basically tests a functionality that communicates between different parts of our application, in our case, our layers (repositories, database, controllers). If you want to know more about testing you can check this [article](https://kentcdodds.com/blog/write-tests)

In our case you will need to install some dependencies:

```ts
npm install --save-dev @types/jest @types/supertest jest supertest ts-jest
```

You will also add the "test" command on package.json:

```ts
"scripts": {
	"start": "ts-node src/server.ts",
	"typeorm": "typeorm-ts-node-commonjs",
	"test": "jest --config jest.config.ts --coverage",
	"build": "rm -rf build/ && tsc"
},
```

After that, configure your jest.config.ts file like this:

```ts
import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/test"],
  maxWorkers: 1,
  detectOpenHandles: true,
};

export default config;
```

After all that setup, we can create our test folder and start writing tests:

```ts
// test/integration/server.test.ts
import request from "supertest";
import { application, Main, Shutdown } from "../../src/server";

describe("Application", () => {
  beforeAll(async () => {
    await Main();
  });

  afterAll(async () => {
    await Shutdown();
  });

  it("Starts and has the proper test environment", async () => {
    expect(process.env.NODE_ENV).toBe("test");
    expect(application).toBeDefined();
  });

  it("Check our healthcheck route", async () => {
    const response = await request(application).get("/main/healthcheck");
    expect(response.status).toBe(200);
  });

  it("Returns 404 when the route requested is not found.", async () => {
    const response = await request(application).get(
      "/a/cute/route/that/does/not/exist/",
    );
    expect(response.status).toBe(404);
  });
});
```
