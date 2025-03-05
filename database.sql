DROP TABLE IF EXISTS `contact`;
CREATE TABLE `contact` (
  `id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `message` longtext NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

LOCK TABLES `contact` WRITE;
INSERT INTO `contact` VALUES
('83358201-4c3b-488f-952c-dc8929f93f32','123','0977836151','1234444');
UNLOCK TABLES;

DROP TABLE IF EXISTS `menu`;

CREATE TABLE `menu` (
  `id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `price` int(11) NOT NULL,
  `image` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

LOCK TABLES `menu` WRITE;
INSERT INTO `menu` VALUES
('42913585-b8f9-4068-b047-6e79999bb7e8','nước ép cam',20000,'https://ik.imagekit.io/devhatebug/casa_coffee/menu_images/caphesua_915Y8omEu.png'),
('9c7aa8f2-7ba9-44c1-9855-60defd2003f4','caramel 234',40000,'https://ik.imagekit.io/devhatebug/casa_coffee/menu_images/suachuakemdau_9rZMZXL_G.png');
UNLOCK TABLES;
