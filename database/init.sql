CREATE DATABASE IF NOT EXISTS `pepplug` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `pepplug`;

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(255) UNIQUE,
    name VARCHAR(255),
    description LONGTEXT,
    short_description TEXT,
    category VARCHAR(100),
    price DECIMAL(10,2),
    stock INT DEFAULT 0,
    image VARCHAR(255),
    active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_ref VARCHAR(255) UNIQUE,
    full_name VARCHAR(255),
    email VARCHAR(255),
    address_line_1 VARCHAR(255),
    address_line_2 VARCHAR(255),
    city VARCHAR(100),
    postcode VARCHAR(100),
    country VARCHAR(100),
    shipping_instructions TEXT,
    amount DECIMAL(10,2),
    paid VARCHAR(20) DEFAULT 'false',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_id INT NULL,
    variant_id VARCHAR(255),
    product_name VARCHAR(255),
    quantity INT,
    price DECIMAL(10,2),
    INDEX (order_id)
);

CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample products (you can remove or replace these)
INSERT INTO products (slug, name, short_description, description, category, price, stock, image, active) VALUES
('cjc-1295', 'CJC-1295', 'Peptide for growth hormone release', 'CJC-1295 is a popular peptide used to increase GH secretion.', 'peptides', 29.99, 50, '/assets/images/cjc-1295-w/product.jpg', 1),
('bpc-157', 'BPC-157', 'Gastrointestinal repair peptide', 'BPC-157 supports tissue repair and gut health.', 'peptides', 24.99, 80, '/assets/images/bpc-157/product.jpg', 1),
('ipamorelin', 'Ipamorelin', 'Ghrelin mimetic peptide', 'Ipamorelin stimulates GH release with minimal side effects.', 'peptides', 19.99, 120, '/assets/images/ipamorelin/product.jpg', 1);
