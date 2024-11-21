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
   `user_id` INT NOT NULL,
   `address_name` VARCHAR(100),
   `street` VARCHAR(255) NOT NULL,
   `city` VARCHAR(100) NOT NULL,
   `state` VARCHAR(100),
   `postal_code` VARCHAR(20) NOT NULL,
   `country` VARCHAR(100) NOT NULL,
   `is_default` BOOLEAN NOT NULL DEFAULT FALSE,
   `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`),
);

CREATE TABLE `product` (
   `product_id` INT AUTO_INCREMENT PRIMARY KEY,
   `title` varchar(255) NOT NULL,
   `description` text NOT NULL,
   `price` decimal(10,2) NOT NULL,
   `image` varchar(255) DEFAULT NULL,
   `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
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

INSERT INTO `product` (title, description, price, image, is_active) VALUES
('Produkt 1', 'Beschreibung für Produkt 1. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, eligendi. Sed et commodi cupiditate itaque sit vero, consequuntur quasi, soluta ratione, animi nobis at quae labore necessitatibus error porro excepturi!', 19.99, 'image1.jpg', TRUE),
('Produkt 2', 'Beschreibung für Produkt 2. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, eligendi. Sed et commodi cupiditate itaque sit vero, consequuntur quasi, soluta ratione, animi nobis at quae labore necessitatibus error porro excepturi!', 29.99, 'image2.jpg', TRUE),
('Produkt 3', 'Beschreibung für Produkt 3. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, eligendi. Sed et commodi cupiditate itaque sit vero, consequuntur quasi, soluta ratione, animi nobis at quae labore necessitatibus error porro excepturi!', 39.99, 'image3.jpg', TRUE),
('Produkt 4', 'Beschreibung für Produkt 4. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, eligendi. Sed et commodi cupiditate itaque sit vero, consequuntur quasi, soluta ratione, animi nobis at quae labore necessitatibus error porro excepturi!', 49.99, 'image4.jpg', TRUE),
('Produkt 5', 'Beschreibung für Produkt 5. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, eligendi. Sed et commodi cupiditate itaque sit vero, consequuntur quasi, soluta ratione, animi nobis at quae labore necessitatibus error porro excepturi!', 59.99, 'image5.jpg', TRUE),
('Produkt 6', 'Beschreibung für Produkt 6. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, eligendi. Sed et commodi cupiditate itaque sit vero, consequuntur quasi, soluta ratione, animi nobis at quae labore necessitatibus error porro excepturi!', 69.99, 'image6.jpg', TRUE),
('Produkt 7', 'Beschreibung für Produkt 7. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, eligendi. Sed et commodi cupiditate itaque sit vero, consequuntur quasi, soluta ratione, animi nobis at quae labore necessitatibus error porro excepturi!', 79.99, 'image7.jpg', TRUE),
('Produkt 8', 'Beschreibung für Produkt 8. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, eligendi. Sed et commodi cupiditate itaque sit vero, consequuntur quasi, soluta ratione, animi nobis at quae labore necessitatibus error porro excepturi!', 89.99, 'image8.jpg', TRUE),
('Produkt 9', 'Beschreibung für Produkt 9. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, eligendi. Sed et commodi cupiditate itaque sit vero, consequuntur quasi, soluta ratione, animi nobis at quae labore necessitatibus error porro excepturi!', 99.99, 'image9.jpg', TRUE),
('Produkt 10', 'Beschreibung für Produkt 10. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, eligendi. Sed et commodi cupiditate itaque sit vero, consequuntur quasi, soluta ratione, animi nobis at quae labore necessitatibus error porro excepturi!', 109.99, 'image10.jpg', TRUE),
('Produkt 11', 'Beschreibung für Produkt 11. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, eligendi. Sed et commodi cupiditate itaque sit vero, consequuntur quasi, soluta ratione, animi nobis at quae labore necessitatibus error porro excepturi!', 119.99, 'image11.jpg', TRUE),
('Produkt 12', 'Beschreibung für Produkt 12. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, eligendi. Sed et commodi cupiditate itaque sit vero, consequuntur quasi, soluta ratione, animi nobis at quae labore necessitatibus error porro excepturi!', 129.99, 'image12.jpg', TRUE),
('Produkt 13', 'Beschreibung für Produkt 13. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, eligendi. Sed et commodi cupiditate itaque sit vero, consequuntur quasi, soluta ratione, animi nobis at quae labore necessitatibus error porro excepturi!', 139.99, 'image13.jpg', TRUE),
('Produkt 14', 'Beschreibung für Produkt 14. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, eligendi. Sed et commodi cupiditate itaque sit vero, consequuntur quasi, soluta ratione, animi nobis at quae labore necessitatibus error porro excepturi!', 149.99, 'image14.jpg', TRUE),
('Produkt 15', 'Beschreibung für Produkt 15. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, eligendi. Sed et commodi cupiditate itaque sit vero, consequuntur quasi, soluta ratione, animi nobis at quae labore necessitatibus error porro excepturi!', 159.99, 'image15.jpg', TRUE),
('Produkt 16', 'Beschreibung für Produkt 16. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, eligendi. Sed et commodi cupiditate itaque sit vero, consequuntur quasi, soluta ratione, animi nobis at quae labore necessitatibus error porro excepturi!', 169.99, 'image16.jpg', TRUE),
('Produkt 17', 'Beschreibung für Produkt 17. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, eligendi. Sed et commodi cupiditate itaque sit vero, consequuntur quasi, soluta ratione, animi nobis at quae labore necessitatibus error porro excepturi!', 179.99, 'image17.jpg', TRUE),
('Produkt 18', 'Beschreibung für Produkt 18. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, eligendi. Sed et commodi cupiditate itaque sit vero, consequuntur quasi, soluta ratione, animi nobis at quae labore necessitatibus error porro excepturi!', 189.99, 'image18.jpg', TRUE),
('Produkt 19', 'Beschreibung für Produkt 19. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, eligendi. Sed et commodi cupiditate itaque sit vero, consequuntur quasi, soluta ratione, animi nobis at quae labore necessitatibus error porro excepturi!', 199.99, 'image19.jpg', TRUE),
('Produkt 20', 'Beschreibung für Produkt 20. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, eligendi. Sed et commodi cupiditate itaque sit vero, consequuntur quasi, soluta ratione, animi nobis at quae labore necessitatibus error porro excepturi!', 209.99, 'image20.jpg', TRUE),
('Produkt 21', 'Beschreibung für Produkt 21. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, eligendi. Sed et commodi cupiditate itaque sit vero, consequuntur quasi, soluta ratione, animi nobis at quae labore necessitatibus error porro excepturi!', 219.99, 'image21.jpg', TRUE),
('Produkt 22', 'Beschreibung für Produkt 22. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, eligendi. Sed et commodi cupiditate itaque sit vero, consequuntur quasi, soluta ratione, animi nobis at quae labore necessitatibus error porro excepturi!', 229.99, 'image22.jpg', TRUE),
('Produkt 23', 'Beschreibung für Produkt 23. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, eligendi. Sed et commodi cupiditate itaque sit vero, consequuntur quasi, soluta ratione, animi nobis at quae labore necessitatibus error porro excepturi!', 239.99, 'image23.jpg', TRUE),
('Produkt 24', 'Beschreibung für Produkt 24. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, eligendi. Sed et commodi cupiditate itaque sit vero, consequuntur quasi, soluta ratione, animi nobis at quae labore necessitatibus error porro excepturi!', 249.99, 'image24.jpg', TRUE),
('Produkt 25', 'Beschreibung für Produkt 25. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, eligendi. Sed et commodi cupiditate itaque sit vero, consequuntur quasi, soluta ratione, animi nobis at quae labore necessitatibus error porro excepturi!', 259.99, 'image25.jpg', TRUE),
('Produkt 26', 'Beschreibung für Produkt 26. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, eligendi. Sed et commodi cupiditate itaque sit vero, consequuntur quasi, soluta ratione, animi nobis at quae labore necessitatibus error porro excepturi!', 269.99, 'image26.jpg', TRUE),
('Produkt 27', 'Beschreibung für Produkt 27. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, eligendi. Sed et commodi cupiditate itaque sit vero, consequuntur quasi, soluta ratione, animi nobis at quae labore necessitatibus error porro excepturi!', 279.99, 'image27.jpg', TRUE),
('Produkt 28', 'Beschreibung für Produkt 28. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, eligendi. Sed et commodi cupiditate itaque sit vero, consequuntur quasi, soluta ratione, animi nobis at quae labore necessitatibus error porro excepturi!', 289.99, 'image28.jpg', TRUE),
('Produkt 29', 'Beschreibung für Produkt 29. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, eligendi. Sed et commodi cupiditate itaque sit vero, consequuntur quasi, soluta ratione, animi nobis at quae labore necessitatibus error porro excepturi!', 299.99, 'image29.jpg', TRUE),
('Produkt 30', 'Beschreibung für Produkt 30. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, eligendi. Sed et commodi cupiditate itaque sit vero, consequuntur quasi, soluta ratione, animi nobis at quae labore necessitatibus error porro excepturi!', 309.99, 'image30.jpg', TRUE),
('Produkt 31', 'Beschreibung für Produkt 31. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, eligendi. Sed et commodi cupiditate itaque sit vero, consequuntur quasi, soluta ratione, animi nobis at quae labore necessitatibus error porro excepturi!', 319.99, 'image31.jpg', TRUE),
('Produkt 32', 'Beschreibung für Produkt 32. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, eligendi. Sed et commodi cupiditate itaque sit vero, consequuntur quasi, soluta ratione, animi nobis at quae labore necessitatibus error porro excepturi!', 329.99, 'image32.jpg', TRUE),
('Produkt 33', 'Beschreibung für Produkt 33. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, eligendi. Sed et commodi cupiditate itaque sit vero, consequuntur quasi, soluta ratione, animi nobis at quae labore necessitatibus error porro excepturi!', 339.99, 'image33.jpg', TRUE),
('Produkt 34', 'Beschreibung für Produkt 34. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, eligendi. Sed et commodi cupiditate itaque sit vero, consequuntur quasi, soluta ratione, animi nobis at quae labore necessitatibus error porro excepturi!', 349.99, 'image34.jpg', TRUE),
('Produkt 35', 'Beschreibung für Produkt 35. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, eligendi. Sed et commodi cupiditate itaque sit vero, consequuntur quasi, soluta ratione, animi nobis at quae labore necessitatibus error porro excepturi!', 359.99, 'image35.jpg', TRUE),
('Produkt 36', 'Beschreibung für Produkt 36. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, eligendi. Sed et commodi cupiditate itaque sit vero, consequuntur quasi, soluta ratione, animi nobis at quae labore necessitatibus error porro excepturi!', 369.99, 'image36.jpg', TRUE),
('Produkt 37', 'Beschreibung für Produkt 37. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, eligendi. Sed et commodi cupiditate itaque sit vero, consequuntur quasi, soluta ratione, animi nobis at quae labore necessitatibus error porro excepturi!', 379.99, 'image37.jpg', TRUE),
('Produkt 38', 'Beschreibung für Produkt 38. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, eligendi. Sed et commodi cupiditate itaque sit vero, consequuntur quasi, soluta ratione, animi nobis at quae labore necessitatibus error porro excepturi!', 389.99, 'image38.jpg', TRUE),
('Produkt 39', 'Beschreibung für Produkt 39. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, eligendi. Sed et commodi cupiditate itaque sit vero, consequuntur quasi, soluta ratione, animi nobis at quae labore necessitatibus error porro excepturi!', 399.99, 'image39.jpg', TRUE),
('Produkt 40', 'Beschreibung für Produkt 40. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, eligendi. Sed et commodi cupiditate itaque sit vero, consequuntur quasi, soluta ratione, animi nobis at quae labore necessitatibus error porro excepturi!', 399.99, 'image40.jpg', TRUE),
('Produkt 41', 'Beschreibung für Produkt 41. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, eligendi. Sed et commodi cupiditate itaque sit vero, consequuntur quasi, soluta ratione, animi nobis at quae labore necessitatibus error porro excepturi!', 399.99, 'image41.jpg', TRUE),
('Produkt 42', 'Beschreibung für Produkt 42. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, eligendi. Sed et commodi cupiditate itaque sit vero, consequuntur quasi, soluta ratione, animi nobis at quae labore necessitatibus error porro excepturi!', 399.99, 'image42.jpg', TRUE),
('Produkt 43', 'Beschreibung für Produkt 43. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, eligendi. Sed et commodi cupiditate itaque sit vero, consequuntur quasi, soluta ratione, animi nobis at quae labore necessitatibus error porro excepturi!', 399.99, 'image43.jpg', TRUE),
('Produkt 44', 'Beschreibung für Produkt 44. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, eligendi. Sed et commodi cupiditate itaque sit vero, consequuntur quasi, soluta ratione, animi nobis at quae labore necessitatibus error porro excepturi!', 399.99, 'image44.jpg', TRUE),
('Produkt 45', 'Beschreibung für Produkt 45. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, eligendi. Sed et commodi cupiditate itaque sit vero, consequuntur quasi, soluta ratione, animi nobis at quae labore necessitatibus error porro excepturi!', 399.99, 'image45.jpg', TRUE),
('Produkt 46', 'Beschreibung für Produkt 46. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, eligendi. Sed et commodi cupiditate itaque sit vero, consequuntur quasi, soluta ratione, animi nobis at quae labore necessitatibus error porro excepturi!', 399.99, 'image46.jpg', TRUE),
('Produkt 47', 'Beschreibung für Produkt 47. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, eligendi. Sed et commodi cupiditate itaque sit vero, consequuntur quasi, soluta ratione, animi nobis at quae labore necessitatibus error porro excepturi!', 399.99, 'image47.jpg', TRUE),
('Produkt 48', 'Beschreibung für Produkt 48. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, eligendi. Sed et commodi cupiditate itaque sit vero, consequuntur quasi, soluta ratione, animi nobis at quae labore necessitatibus error porro excepturi!', 399.99, 'image48.jpg', TRUE),
('Produkt 49', 'Beschreibung für Produkt 49. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, eligendi. Sed et commodi cupiditate itaque sit vero, consequuntur quasi, soluta ratione, animi nobis at quae labore necessitatibus error porro excepturi!', 399.99, 'image49.jpg', TRUE),
('Produkt 50', 'Beschreibung für Produkt 50. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit, eligendi. Sed et commodi cupiditate itaque sit vero, consequuntur quasi, soluta ratione, animi nobis at quae labore necessitatibus error porro excepturi!', 409.99, 'image50.jpg', TRUE);
