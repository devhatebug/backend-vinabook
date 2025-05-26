CREATE TABLE book (
    id CHAR(36) NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price FLOAT NOT NULL,
    image VARCHAR(255) NOT NULL,
    description LONGTEXT NOT NULL,
    type ENUM('new', 'sale') DEFAULT 'new',
    labelId CHAR(36) NOT NULL,
    quantity INT DEFAULT 0,
    FOREIGN KEY (labelId) REFERENCES `label` (id) ON DELETE CASCADE ON UPDATE CASCADE
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
    ) NOT NULL DEFAULT 'pending',
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
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

INSERT INTO
    user (
        id,
        email,
        username,
        password,
        role
    )
VALUES (
        '3f73a9e7-1a6c-4f5e-9025-7787a1ef7c9e',
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

CREATE TABLE `label` (
    id CHAR(36) NOT NULL DEFAULT(UUID()),
    name VARCHAR(255) NOT NULL,
    value VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE LEVEL_USER (
    id CHAR(36) NOT NULL DEFAULT(UUID()),
    userId CHAR(36) NOT NULL,
    level INT NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    FOREIGN KEY (userId) REFERENCES user (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE POINT_PURCHASE (
    id CHAR(36) NOT NULL DEFAULT(UUID()),
    userId CHAR(36) NOT NULL,
    point INT NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    FOREIGN KEY (userId) REFERENCES user (id) ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO LEVEL_USER (
    id,
    userId,
    level
)
VALUES (
    UUID(),
    '3f73a9e7-1a6c-4f5e-9025-7787a1ef7c9e',
    0
);

INSERT INTO POINT_PURCHASE (
    id,
    userId,
    point
)
VALUES (
    UUID(),
    '3f73a9e7-1a6c-4f5e-9025-7787a1ef7c9e',
    1000
);
