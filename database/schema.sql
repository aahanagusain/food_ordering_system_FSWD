CREATE DATABASE IF NOT EXISTS smart_canteen;
USE smart_canteen;

CREATE TABLE Customer (
    customer_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    customer_type ENUM('Student', 'Staff', 'Guest') DEFAULT 'Guest'
);

CREATE TABLE Category (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(50) NOT NULL
);

CREATE TABLE Menu_Item (
    item_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    category_id INT,
    description TEXT,
    price DECIMAL(8,2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    preparation_time INT DEFAULT 5,
    status VARCHAR(20) DEFAULT 'Available',
    FOREIGN KEY (category_id) REFERENCES Category(category_id)
);

CREATE TABLE Orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'Paid',
    order_status VARCHAR(20) DEFAULT 'Completed',
    payment_method VARCHAR(20) DEFAULT 'Cash',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id)
);

CREATE TABLE Order_Details (
    order_detail_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT,
    item_id INT,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(8,2) NOT NULL,
    total_price DECIMAL(10,2) DEFAULT 0,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES Menu_Item(item_id)
);

INSERT INTO Category (category_name) VALUES
('Beverages'),('Snacks'),('Main Course'),('Desserts'),('Breakfast');

INSERT INTO Menu_Item (name, category_id, price, stock_quantity) VALUES
('Masala Chai', 1, 15.00, 100),('Coffee', 1, 20.00, 80),('Cold Coffee', 1, 35.00, 50),
('Samosa', 2, 12.00, 200),('Vada Pav', 2, 25.00, 150),('Poha', 2, 20.00, 100),
('Dal Rice', 3, 45.00, 60),('Rajma Rice', 3, 50.00, 50),('Chole Bhature', 3, 60.00, 40),
('Gulab Jamun', 4, 25.00, 100),('Ice Cream', 4, 30.00, 50),('Kheer', 4, 35.00, 40),
('Idli Sambar', 5, 30.00, 80),('Dosa', 5, 40.00, 60),('Paratha', 5, 35.00, 70);

INSERT INTO Customer (name, email, customer_type) VALUES
('Arjun Mehta', 'arjun@college.edu', 'Student'),('Kavya Reddy', 'kavya@college.edu', 'Student'),
('Dr. Suresh Kumar', 'suresh@college.edu', 'Staff'),('Prof. Meera Joshi', 'meera@college.edu', 'Staff');