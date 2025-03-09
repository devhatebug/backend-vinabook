# Nodejs + Express + MongoDB + Typescript

## Getting Started

### Install dependencies

```bash
pnpm install
```

### Create Database

```bash
  create database vinabook;
  use vinabook;
  CREATE TABLE book (
    id CHAR(36) NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price FLOAT NOT NULL,
    image VARCHAR(255) NOT NULL,
    description LONGTEXT NOT NULL,
    type ENUM('new', 'sale') DEFAULT 'new'
);

CREATE TABLE `order` (
    id CHAR(36) NOT NULL PRIMARY KEY,
    idBook CHAR(36) NOT NULL,
    nameClient VARCHAR(255) NOT NULL,
    phoneNumber VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    note TEXT NULL,
    status ENUM('pending', 'completed', 'canceled', 'processing') NOT NULL,
    FOREIGN KEY (idBook) REFERENCES book(id) ON DELETE CASCADE
);

```

### Create .env file

```bash
cp .env.example .env
```

### Start development server

```bash
pnpm run dev
```

## Description

- **`GET /books`**: Get all books
- **`GET /books/:id`**: Get book by id
- **`POST /books`**: Create new book
- **`PUT /books/:id`**: Update book by id
- **`DELETE /books/:id`**: Delete book by id

- **`GET /orders`**: Get all orders
- **`GET /orders/get-by-id/:id`**: Get order by id
- **`POST /orders`**: Create new order
- **`PUT /orders/:id`**: Update order by id
- **`DELETE /orders/:id`**: Delete order by id
