# API

API Is not yet ready for production.
Don't deploy it!

# Overview
The source code repo contains 3 projects API, UI, and Tests.
All three have their own dependencies.
Please see the appropriate readme section (API/UI/Testing) for running and debugging each one of them.

API projects handles interaction of the UI app with the database. Such as `login`,`register` and `User listing`
## Requirements
* Node >18
* Docker

## Stack
* `node` runtime
* `expressjs` server
* `knex` query builder
* `mysql` database
* `Joe` validation

## Initialization
```
cd api
npm install
```

## Local DB setup
* Create a MySQL database on localhost with the credentails, outlined in .env file
* Run Migrations and Seeds

### Migrations
```
npx knex migrate:latest
```
#### Additional DEV migration tasks
```
   npx knex migrate:rollback
   npx knex migrate:make create_users
```
## Seeds
```
npx knex seed:run
```
#### Additional DEV seed tasks
```
npx knex seed:make seed_admin_user
```
## Running and Debugging API
### Run and Debug in Local Node instance
Run and Debug -> Start API Debug

### Running in Local Docker instance
```
cd api
docker-compose up
```

The api app will be served on http://localhost:3000

# UI
UI Project is the customer-facing application that presents the dialogs, offers to log in and register and performs the business functions of the app, which is editing customer's ScreeSet configurations.

## Requirements
* Node >18

## Initialization
```
cd ui
npm install
```

## Running the app
```
npm run serve
```
Launch the browser: http://localhost:9000

## Debugging the app
```
npm run serve
```
Run and Debug -> Launch Chrome 

# Testing
## API unit tests
API Unit test are executed with jest test runner.
To run API tests execute:
```
npm run test:api
```

