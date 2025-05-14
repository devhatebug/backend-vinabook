# Nodejs + Express + MySQL + Typescript

## Getting Started

### Install dependencies

```bash
pnpm install
```

### Create Database

```bash
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
    nameClient VARCHAR(255) NOT NULL,
    phoneNumber VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    note TEXT NULL,
    status ENUM('pending', 'completed', 'canceled', 'processing') NOT NULL
);
CREATE TABLE user (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') NOT NULL,
    PRIMARY KEY (id)
);

INSERT INTO user (id, username, password, role)
VALUES (UUID(), 'admin', '$2a$10$pQ9Al2UHeoHbISdQZovXs.oGkgoNJi/acT9HLDsW3jR3Aojv1BlDS', 'admin');

CREATE TABLE order_details (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    orderId CHAR(36) NOT NULL,
    bookId CHAR(36) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price FLOAT NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (orderId) REFERENCES `order`(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (bookId) REFERENCES book(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE cart (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    userId CHAR(36) NOT NULL,
    bookId CHAR(36) NOT NULL,
    status ENUM('pending', 'completed') NOT NULL DEFAULT 'pending',
    quantity INT NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (bookId) REFERENCES book(id) ON DELETE CASCADE ON UPDATE CASCADE
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
