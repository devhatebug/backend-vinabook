CREATE TABLE book (
    id CHAR(36) NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price FLOAT NOT NULL,
    image VARCHAR(255) NOT NULL,
    description LONGTEXT NOT NULL,
    type ENUM('new', 'sale') DEFAULT 'new',
    label VARCHAR(255)
);

CREATE TABLE `order` (
    id CHAR(36) NOT NULL PRIMARY KEY,
    userId CHAR(36) NOT NULL,
    nameClient VARCHAR(255) NOT NULL,
    phoneNumber VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    note TEXT NULL,
    status ENUM(
        'pending',
        'completed',
        'canceled',
        'processing'
    ) NOT NULL
    DEFAULT 'pending',
    FOREIGN KEY (userId) REFERENCES `user` (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE user (
    id CHAR(36) NOT NULL DEFAULT(UUID()),
    email VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    PRIMARY KEY (id)
);

INSERT INTO user (id, email, username, password, role)
VALUES (
    UUID(),
    'admin@gmail.com',
    'admin',
    '$2a$10$pQ9Al2UHeoHbISdQZovXs.oGkgoNJi/acT9HLDsW3jR3Aojv1BlDS',
    'admin'
);


CREATE TABLE order_details (
    id CHAR(36) NOT NULL DEFAULT(UUID()),
    orderId CHAR(36) NOT NULL,
    bookId CHAR(36) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price FLOAT NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (orderId) REFERENCES `order` (id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (bookId) REFERENCES book (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE cart (
    id CHAR(36) NOT NULL DEFAULT(UUID()),
    userId CHAR(36) NOT NULL,
    bookId CHAR(36) NOT NULL,
    status ENUM('pending', 'completed') NOT NULL DEFAULT 'pending',
    quantity INT NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    FOREIGN KEY (userId) REFERENCES user (id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (bookId) REFERENCES book (id) ON DELETE CASCADE ON UPDATE CASCADE
);
