CREATE DATABASE fi36_arndt_fapdw;
USE fi36_arndt_fapdw;

CREATE TABLE `user` (
   `user_id` INT AUTO_INCREMENT PRIMARY KEY,
   `name` VARCHAR(255) NOT NULL,
   `email` VARCHAR(64) NOT NULL UNIQUE,
   `username` VARCHAR(255) NOT NULL UNIQUE,
   `password_hash` VARCHAR(255) NOT NULL,
   `role` VARCHAR(50),
   `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `address` (
   `address_id` INT AUTO_INCREMENT PRIMARY KEY,
   `address_name` VARCHAR(100),
   `street` VARCHAR(255) NOT NULL,
   `city` VARCHAR(100) NOT NULL,
   `state` VARCHAR(100) NOT NULL,
   `postal_code` VARCHAR(20) NOT NULL,
   `country` VARCHAR(100) NOT NULL,
   `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `product` (
   `product_id` INT AUTO_INCREMENT PRIMARY KEY,
   `title` varchar(255) NOT NULL,
   `description` text NOT NULL,
   `price` decimal(10,2) NOT NULL,
   `image` varchar(255) DEFAULT NULL,
   `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `order` (
   `order_id` INT AUTO_INCREMENT PRIMARY KEY,
   `user_id` INT NOT NULL,
   `address_id` INT NOT NULL,
   `sum_price` DECIMAL(10, 2),
   `state` TINYINT NOT NULL DEFAULT 0,
   `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   `stateUpdatedAt` TIMESTAMP DEFAULT NULL,
   FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`),
   FOREIGN KEY (`address_id`) REFERENCES `address`(`address_id`)
);

CREATE TABLE `order_item` (
   `product_id` INT NOT NULL,
   `order_id` INT NOT NULL,
   `price` DECIMAL(10, 2) NOT NULL,
   `quantity` INT NOT NULL DEFAULT 1,
   PRIMARY KEY (product_id, order_id),
   FOREIGN KEY (product_id) REFERENCES product(product_id),
   FOREIGN KEY (order_id) REFERENCES order(order_id)
);

CREATE USER 'proshop-user'@'localhost' IDENTIFIED BY 'proshop1234';
GRANT ALL PRIVILEGES ON fi36_arndt_fapdw.* TO 'proshop-user'@'localhost';
FLUSH PRIVILEGES;