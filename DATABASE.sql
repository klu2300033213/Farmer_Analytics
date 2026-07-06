USE farmer_analytics;

SHOW TABLES;
CREATE TABLE `app_users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `contact_messages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `admin_reply` varchar(4000) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `message` varchar(4000) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `replied_at` datetime(6) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `user_role` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;



CREATE TABLE `crop_prices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `crop_name` varchar(50) DEFAULT NULL,
  `price` double DEFAULT NULL,
  `year` int DEFAULT NULL,
  `month` varchar(20) DEFAULT NULL,
  `season` varchar(20) DEFAULT NULL,
  `location` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=152 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `market_prices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `crop` varchar(255) DEFAULT NULL,
  `mandi` varchar(255) DEFAULT NULL,
  `price` double NOT NULL,
  `price_date` date DEFAULT NULL,
  `source` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `market_prices_live` (
  `id` int NOT NULL AUTO_INCREMENT,
  `state` varchar(50) DEFAULT NULL,
  `district` varchar(50) DEFAULT NULL,
  `mandi` varchar(100) DEFAULT NULL,
  `crop_name` varchar(50) DEFAULT NULL,
  `min_price` double DEFAULT NULL,
  `modal_price` double DEFAULT NULL,
  `max_price` double DEFAULT NULL,
  `price_date` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1663977 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;




CREATE TABLE `ml_model_snapshots` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `crop_name` varchar(120) NOT NULL,
  `feature_mean_csv` tinytext NOT NULL,
  `feature_std_csv` tinytext NOT NULL,
  `model_version` varchar(40) NOT NULL,
  `sample_count` int NOT NULL,
  `target_mean` double NOT NULL,
  `target_std` double NOT NULL,
  `trained_at` datetime(6) NOT NULL,
  `training_mape` double NOT NULL,
  `weights_csv` tinytext NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK71609w76e48hanqpbtmb2jqkq` (`crop_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;




CREATE TABLE `pesticide_import_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `file_name` varchar(260) DEFAULT NULL,
  `inserted_rows` int DEFAULT NULL,
  `notes` varchar(500) DEFAULT NULL,
  `skipped_rows` int DEFAULT NULL,
  `source_section` varchar(120) DEFAULT NULL,
  `total_rows` int DEFAULT NULL,
  `updated_rows` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;





CREATE TABLE `pesticide_products` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active_ingredient` varchar(300) DEFAULT NULL,
  `approved_crops` tinytext,
  `concentration` varchar(120) DEFAULT NULL,
  `formulation` varchar(120) DEFAULT NULL,
  `last_imported_at` datetime(6) NOT NULL,
  `legal_status` varchar(40) DEFAULT NULL,
  `product_name` varchar(300) NOT NULL,
  `registrant_company` varchar(300) DEFAULT NULL,
  `registration_number` varchar(120) NOT NULL,
  `source_date` varchar(40) DEFAULT NULL,
  `source_section` varchar(120) DEFAULT NULL,
  `source_year` int DEFAULT NULL,
  `target_pests` tinytext,
  `price_per_unit` double DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK67orq31ykmiyf7vjjv9oqow4l` (`registration_number`,`product_name`)
) ENGINE=InnoDB AUTO_INCREMENT=1121 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
