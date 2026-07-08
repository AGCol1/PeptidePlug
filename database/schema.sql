CREATE TABLE products (
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

CREATE TABLE orders (
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

CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_id INT NULL,
    variant_id VARCHAR(255),
    product_name VARCHAR(255),
    quantity INT,
    price DECIMAL(10,2)
);
