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
