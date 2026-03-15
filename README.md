# Auth Service API

A production-ready authentication microservice built with **Node.js, Express, TypeScript, Prisma, and PostgreSQL (NeonDB)**.
This service implements secure authentication features such as **JWT access tokens, refresh tokens, email verification, password reset flows, rate limiting, and API documentation with Swagger**.
It is fully containerized using **Docker** for easy deployment.

## Tech Stack

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL (NeonDB)
- JWT Authentication
- Swagger API Documentation
- Docker

## API Endpoints

| Method | Endpoint | Description |
|------|------|------|
| POST | /auth/register | Register new user |
| POST | /auth/verify-email | Verify user email |
| POST | /auth/login | Login user |
| POST | /auth/refresh | Refresh access token |
| POST | /auth/logout | Logout user |
| GET | /auth/me | Get authenticated user |
| POST | /auth/forgot-password | Request password reset |
| POST | /auth/reset-password | Reset password |

## Run Locally

```bash
docker compose up --build
```

# Add Environment Variables Section

## Environment variable

Create a `.env` file in the root directory:

```md
POSTGRES_DATABASE_URL=your_database_url
JWT_SECRETKEY=your_secret_key
JWT_REFRESH_SECRETKEY=your_refresh_secret
```
## API Documentation

Swagger documentation is available at:

http://localhost:5000/api-docs

## Project Structure

```
│
├── config
│   ├── prisma.ts
│   └── swagger.config.ts
│
├── controllers
│   └── auth.controller.ts
│
├── middleware
│   ├── auth.middleware.ts
│   ├── authorization.middleware.ts
│   └── ratelimiting.middleware.ts
│
├── prisma
│   └── schema.prisma
│
├── routes
│   ├── auth.route.ts
│   └── authorization.route.ts
│
├── services
│   └── auth.service.ts
│
├── validators
│   ├── login.validation.ts
│   └── register.validation.ts
│
├── utils
│
├── .dockerignore
├── docker-compose.yml
├── Dockerfile
├── .env
├── package.json
├── tsconfig.json
├── server.ts
└── README.md
```




