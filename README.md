# STOCK TRADE API

API is built using Fastify server and PostgresQL database. 

## RUN
You can run both API and database server locally using Docker.

### Prerequisites
You need `node` of version `16.x` with `npm` installed locally. You could use either you own instance of PostgresQL 
or can run one in Docker.

#### Clone repository locally

```
git clone git@github.com:omgzhyla/stock-trade-api.git
cd stock-trade-api
```

#### Install all dependencies

```
npm install
```

#### Run
Run PostgresQL in docker
```
npm run db:run
```
Run server
```
npm run start:dev
```
Stop PostgresQL server 
```
npm run db:stop
```

#### Knex migrations
To operate with knex migrations use this command

```
npm run knex migrate:<command>
```

#### Run tests
```
npm run test:api
```

## Prettier and TSlint

This project uses [prettier](https://prettier.io/) and [tslint](https://github.com/palantir/tslint) to enforce
a consistent style and best practices. It also have git hook that run `prettier` and `tslint` for every commit
to enforce it.

To fix linting errors automatically run
```
npm lint-fix
```

# NOTES

## `Ajv` validation library
Fastify documentation suggests `Ajv` for request validation purposes. I don't like the fact it throws plain `Error`
exception and there's no way to guest that it was a validation error in the top-level error handler.

## `Server` class structure
It might be better to use some `builder` pattern here.

## Stocks stats
Not sure if I understood what `daily` actually means: 

Fluctuation is defined via `daily rise` and `daily fall` in price and sounds like it's somehow related to calendar day. 
However, stock price plot describes price fluctuation as three trades happened in two different days: 
the lowest price is on June 25 and following higher price was on next day June 26.

I implemented algorithm that doesn't take in account actual dates.
