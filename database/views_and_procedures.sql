USE smart_canteen;

CREATE VIEW v_menu AS
SELECT m.item_id, m.name, c.category_name, m.price, m.stock_quantity,
CASE WHEN m.stock_quantity = 0 THEN 'Out of Stock' ELSE 'Available' END as status
FROM Menu_Item m JOIN Category c ON m.category_id = c.category_id;

CREATE VIEW v_orders AS
SELECT o.order_id, o.order_date, c.name as customer_name, o.total_amount,
COUNT(od.order_detail_id) as item_count
FROM Orders o JOIN Customer c ON o.customer_id = c.customer_id
LEFT JOIN Order_Details od ON o.order_id = od.order_id
GROUP BY o.order_id;