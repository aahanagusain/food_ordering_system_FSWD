USE smart_canteen;

-- Get menu items  //Give category to all items like coffee isput in Beverages
SELECT m.item_id, m.name, c.category_name, m.price, m.stock_quantity
FROM Menu_Item m JOIN Category c ON m.category_id = c.category_id
WHERE m.stock_quantity > 0;

-- Get customer orders to isme order_id=
SELECT o.order_id, o.order_date, o.total_amount, COUNT(od.order_detail_id) as item_count
FROM Orders o LEFT JOIN Order_Details od ON o.order_id = od.order_id
WHERE o.customer_id = 1 GROUP BY o.order_id ORDER BY o.order_date DESC;

-- Get order details
SELECT o.order_id, c.name as customer_name, m.name as item_name, od.quantity, od.unit_price
FROM Orders o JOIN Customer c ON o.customer_id = c.customer_id
JOIN Order_Details od ON o.order_id = od.order_id
JOIN Menu_Item m ON od.item_id = m.item_id WHERE o.order_id = 1;

-- Top selling items
SELECT m.name, SUM(od.quantity) as total_sold, SUM(od.unit_price * od.quantity) as revenue
FROM Order_Details od JOIN Menu_Item m ON od.item_id = m.item_id
JOIN Orders o ON od.order_id = o.order_id GROUP BY m.item_id ORDER BY total_sold DESC LIMIT 10;

-- Daily sales
SELECT DATE(o.order_date) as sale_date, COUNT(*) as orders, SUM(o.total_amount) as revenue
FROM Orders o GROUP BY DATE(o.order_date);