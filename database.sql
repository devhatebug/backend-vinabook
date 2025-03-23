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
    quantity INT NOT NULL DEFAULT 1,
    FOREIGN KEY (idBook) REFERENCES book(id) ON DELETE CASCADE
);
CREATE TABLE user (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') NOT NULL,
    PRIMARY KEY (id)
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
