---
title: Como implementar um backend com Node?
pubDate: 2025-01-27
---

## Introdução

### O que você pode esperar deste post?

Após ler este post, você será capaz de desenvolver APIs RESTful usando TypeScript e Express, conectadas a um banco de dados e utilizando o TypeORM como ferramenta ORM.

Além disso, você adquirirá conhecimentos para organizar seus projetos, lidar com erros, implementar logs, configurar arquivos de ambiente, variáveis de ambiente e utilizar o Docker para conteinerizar sua aplicação.

### Pré-requisitos

Não é uma regra, mas acredito que você aproveitará melhor este post se tiver conhecimento básico sobre:

- JavaScript / TypeScript
- O que é uma API
- Princípios REST

Lembrando que não é obrigatório! Vou abordar brevemente esses tópicos ao longo do post.

### Por que estou usando Node e Express para isso?

Bem, respondendo de forma simples: pura curiosidade! 😄

No momento em que escrevo este post, trabalho com o ecossistema .NET no back-end e com React e TypeScript no front-end. Fiquei curioso para ver como seria trabalhar com TypeScript/JavaScript no back-end também, por isso escolhi essas tecnologias.

Desculpe se você esperava algo mais "bonito".

## Conceitos fundamentais

### O que são NodeJS e Express?

NodeJS é um ambiente de execução JavaScript que permite rodar JavaScript fora do navegador. Ele foi construído sobre o motor V8 do Chrome, e como o V8 compila diretamente o código JavaScript em código de máquina, ele se torna altamente eficiente. Você pode conferir mais sobre isso [aqui](https://www.freecodecamp.org/news/how-javascript-works-behind-the-scenes/) ([documentação](https://nodejs.org/en)).

Express é um framework para construção de aplicações web utilizando NodeJS ([documentação](https://expressjs.com/)).

### O que é TypeScript e por que usá-lo?

TypeScript é um [superconjunto](https://www.epicweb.dev/what-is-a-superset-in-programming) de JavaScript desenvolvido pela Microsoft. Ele adiciona uma camada de tipagem ao JavaScript, permitindo definir tipos para variáveis, parâmetros e retornos de funções.

O uso do TypeScript no desenvolvimento da sua aplicação pode garantir segurança de tipos, melhorar a manutenção do código e facilitar a detecção de erros.

### APIs RESTful

API é a sigla para Application Programming Interface, utilizada para a comunicação entre servidores e serviços.

Uma API RESTful é uma API que segue os princípios do [REST](https://restfulapi.net/), que incluem:

- Cacheabilidade
- Stateless (sem estado)
- Uso de URIs
- Uso de verbos HTTP

### O que é um ORM e o que é TypeORM?

ORM (Object-Relational Mapper) é uma ferramenta que ajuda a mapear e traduzir os modelos de banco de dados relacionais para modelos orientados a objetos utilizados em aplicações cliente.

O TypeORM é uma dessas ferramentas, permitindo trabalhar com bancos de dados de forma mais estruturada e orientada a objetos.

## Configuração do Projeto

### Configuração Inicial

Para iniciar nosso projeto:

```ts
npx typeorm init --name MyProject --database postgres

cd MyProject

npm i express  @types/express --save
```

Eu gosto de deletar o arquivo `src/index.ts` e criar um `server.ts`, mas a escolha é sua.

Com isso, teremos uma estrutura inicial para nossa aplicação, mas me sinto mais confortável adicionando algumas outras pastas e arquivos que abordarei agora. Antes disso, você precisará dessas dependências:

```ts
npm i winston
npm i dotenv
```

Antes de configurar nossos arquivos de configuração, ajuste seu `tsconfig.json` para este formato, a fim de evitar problemas de importação com algumas bibliotecas, preparar a build da aplicação e ajudar nos testes:

```json
{
  "compilerOptions": {
    "lib": ["es5", "es6"],
    "target": "ES2016",
    "module": "commonjs",
    "moduleResolution": "node",
    "outDir": "./build",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "sourceMap": true,
    "esModuleInterop": true,
    "types": ["jest", "reflect-metadata"]
  },
  "exclude": ["node_modules/"],
  "include": ["src/**/*.ts", "test/**/*.ts"]
}
```

Aqui estão alguns arquivos de configuração onde coloco algumas configurações e o arquivo de logging:

```ts
// src/config/config.ts
import dotenv from "dotenv";

dotenv.config();

// Flags de ambiente
export const ENV = {
  DEVELOPMENT: process.env.NODE_ENV === "development",
  TEST: process.env.NODE_ENV === "test",
};

// Configuração do servidor
export const SERVER = {
  HOSTNAME: process.env.SERVER_HOSTNAME || "localhost",
  PORT: process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 1337,
};

// Configuração do banco de dados
export const DATABASE = {
  HOST: process.env.DB_HOST || "localhost",
  PORT: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  USERNAME: process.env.DB_USERNAME || "postgres",
  PASSWORD: process.env.DB_PASSWORD || "postgres",
  NAME: process.env.DB_DATABASE || "localdb",
};
```

```ts
// src/config/logger.ts
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

### Por que precisamos desses arquivos?

Por duas principais razões:

1. É mais fácil definir variáveis de ambiente e configurações quando você tem um arquivo centralizado.
2. É útil para acompanhar o que está acontecendo em algum processo da nossa aplicação. Acredite em mim quando digo que logging pode te salvar de MUITO trabalho se for corretamente configurado. Nesta aplicação usaremos [winston](https://github.com/winstonjs/winston).

Nesta aplicação, usaremos essas variáveis de ambiente para configurar nosso banco de dados.

### Camada de Banco de Dados

### Trabalhando com entidades

Antes de configurar nosso arquivo `data-source.ts`, precisamos criar nossas entidades. Mas você pode se perguntar: o que são essas entidades?

Basicamente, são classes que contêm a lógica de negócio e atributos que usaremos em nossa aplicação e que serão mapeados para tabelas no banco de dados.

Nesta aplicação, usaremos um livro (Book) como entidade para realizar operações.

Crie uma pasta `entities` e coloque o arquivo `book.ts` dentro dela:

```ts
// src/entities/book.ts
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

Para tornar suas entidades disponíveis para criação no banco de dados, você precisará usar alguns decoradores oferecidos pelo TypeORM.

Acima está uma implementação simples de um modelo que se torna uma entidade no banco de dados, usando decoradores para chave primária, colunas e data.

Se quiser saber mais sobre isso, consulte a [documentação](https://typeorm.io/).

Não é obrigatório, mas acredito que seja útil criar uma interface para essa entidade, a fim de lidar com os repositórios e definir tipos:

```ts
// src/interfaces/IBook.ts
export interface IBook {
  id: number;
  author: string;
  title: string;
  publishedAt: Date;
}
```

### Configuração do TypeORM

Para configurar nosso TypeORM, moveremos a configuração para dentro da pasta `database` e manteremos assim:

```ts
// src/database/data-source.ts
import "reflect-metadata";
import { DataSource } from "typeorm";
import { DATABASE } from "../config/config";
import { Book } from "../entities/book";

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

## Implementação da API

### Organizando controladores e suas rotas

Se você não sabe o que são controladores, eles são os pontos de entrada para aplicações externas se comunicarem com a nossa. É por meio deles e de suas URIs que saberemos qual ação ou recurso está sendo solicitado.

Antes de mostrar a implementação do nosso controlador, utilizamos esquemas, que são basicamente um modelo que define a estrutura e as regras de validação para os dados:

Estamos usando [joi](https://joi.dev/) para lidar com esses esquemas e validações:

```node
npm i joi
```

Neste caso, criamos um esquema para lidar com algumas operações que faremos:

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

Agora podemos passar para o nosso controlador:

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
          message: "Falha na validação",
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
```

### Definição do roteador

Depois de criar nosso controlador, precisamos definir o arquivo de rotas, que centralizará as rotas dos nossos controladores:

```ts
// src/routes/bookRoutes.ts
import { Router } from "express";
import { bookRouter } from "../controllers/bookController";

const routers = Router();

routers.use(bookRouter);

export default routers;
```

### O uso de middlewares

Middlewares são funções que são executadas entre o recebimento de uma requisição e o envio de uma resposta em uma aplicação web.

Na nossa aplicação, temos 4 middlewares:

- **corsHandler**: Lida com o compartilhamento de recursos entre origens diferentes (CORS) definindo cabeçalhos apropriados para permitir requisições de outras origens.
- **errorHandler**: Processa erros, os registra e envia respostas de erro aos clientes.
- **loggingHandler**: Registra informações sobre requisições recebidas e seus resultados.
- **routeNotFound**: Lida com casos em que a rota solicitada não existe (erros 404).

### Configuração do servidor

Para implementar todas as configurações que preparamos, temos nosso arquivo `server.ts`, responsável por iniciar nosso servidor:

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
export let httpServer: ReturnType<typeof http.createServer>;

export const Main = async () => {
  logger.info("-----------------------");
  logger.info("Inicializando API");
  logger.info("-----------------------");

  application.use(express.urlencoded({ extended: true }));
  application.use(express.json());

  application.use(loggingHandler);
  application.use(corsHandler);

  application.use(routers);
  application.use(routeNotFound);
  application.use(errorHandler);

  httpServer = http.createServer(application);

  httpServer.listen(SERVER.PORT, SERVER.HOSTNAME, () => {
    logger.info(`Servidor rodando em http://${SERVER.HOSTNAME}:${SERVER.PORT}`);
  });

  await AppDataSource.initialize();
  logger.info("Banco de dados conectado!");
};

if (require.main === module) {
  Main().catch((error) => {
    logger.error("Falha ao iniciar o servidor:", error);
  });
}
```

Depois de configurar o `server.ts`, você precisa alterar o arquivo de inicialização no `package.json`, mudando de `src/index.ts` para `src/server.ts`, na seção de scripts:

```json
"scripts": {
  "start": "ts-node src/server.ts",
  "typeorm": "typeorm-ts-node-commonjs"
}
```

Quando terminar todas essas configurações, você estará pronto para iniciar sua aplicação e testar seus endpoints!

Para iniciar a aplicação, basta digitar:

```ts
npm start
```

## Testes

Por que testar uma aplicação simples, você pode perguntar? Bem, eu acredito que começar a escrever testes pode ajudar você a prevenir bugs em sua aplicação, reduzir tarefas manuais/testar endpoints e também melhorar seu código para torná-lo mais fácil de testar.

Para esta aplicação, vamos escrever testes de integração, que basicamente testam uma funcionalidade que se comunica entre diferentes partes da nossa aplicação, no nosso caso, nossas camadas (repositórios, banco de dados, controladores). Se você quiser saber mais sobre testes, pode verificar este [artigo](https://kentcdodds.com/blog/write-tests).

No nosso caso, você precisará instalar algumas dependências:

```ts
npm install --save-dev @types/jest @types/supertest jest supertest ts-jest
```

Você também adicionará o comando "test" no package.json:

```json
"scripts": {
	"start": "ts-node src/server.ts",
	"typeorm": "typeorm-ts-node-commonjs",
	"test": "jest --config jest.config.ts --coverage",
	"build": "rm -rf build/ && tsc"
},
```

E adicionar o tipo jest no seu tsconfig.json:

```json
{
  "compilerOptions": {
    "lib": ["es5", "es6"],
    "target": "ES2016",
    "module": "commonjs",
    "moduleResolution": "node",
    "outDir": "./build",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "sourceMap": true,
    "esModuleInterop": true,
    "types": ["jest", "reflect-metadata"]
  },
  "exclude": ["node_modules/"],
  "include": ["src/**/*.ts", "test/**/*.ts"]
}
```

Depois disso, você precisa criar um jest.config.ts na raiz do seu projeto, assim:

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

Após toda essa configuração, podemos criar nossa pasta de teste e começar a escrever testes:

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

## Conclusão

### O que você aprendeu?

Abordamos conceitos fundamentais do desenvolvimento de uma API RESTful com Node.js usando TypeScript.

Você aprendeu sobre ORMs, sua usabilidade e como eles podem ser aplicados ao seu fluxo de trabalho de desenvolvimento.

Também discutimos a importância dos testes em uma aplicação e como escrevê-los com jest.

### Quais são os próximos passos?

Um ótimo próximo passo seria desenvolver sua própria API para resolver um problema do mundo real ou explorar um contexto de negócios diferente. Por exemplo, você poderia construir um sistema de gerenciamento de produtos para uma loja local, um gerenciador de tarefas para produtividade pessoal ou um sistema de rastreamento de inventário para uma pequena empresa.

O importante é escolher um projeto que desafie você a aplicar o que aprendeu enquanto se alinha com seus interesses!
