# Smart Canteen Ordering System - ER Diagram

## Entity Relationship Diagram

```
                    ┌─────────────────┐
                    │    Customer     │
                    ├─────────────────┤
                    │ customer_id (PK)│
                    │ name            │
                    │ email           │
                    │ phone           │
                    │ customer_type   │
                    │ registration_date│
                    │ is_active       │
                    └─────────────────┘
                            │
                            │ 1:N
                            │
                    ┌─────────────────┐
                    │     Orders      │
                    ├─────────────────┤
                    │ order_id (PK)   │
                    │ customer_id (FK)│
                    │ staff_id (FK)   │
                    │ order_date      │
                    │ total_amount    │
                    │ payment_status  │
                    │ order_status    │
                    │ payment_method  │
                    │ special_instructions│
                    │ estimated_time  │
                    └─────────────────┘
                            │
                            │ 1:N
                            │
                    ┌─────────────────┐
                    │  Order_Details  │
                    ├─────────────────┤
                    │order_detail_id(PK)│
                    │ order_id (FK)   │
                    │ item_id (FK)    │
                    │ quantity        │
                    │ unit_price      │
                    │ total_price     │
                    │ special_notes   │
                    └─────────────────┘
                            │
                            │ N:1
                            │
                    ┌─────────────────┐
                    │   Menu_Item     │
                    ├─────────────────┤
                    │ item_id (PK)    │
                    │ name            │
                    │ category_id (FK)│
                    │ description     │
                    │ price           │
                    │ stock_quantity  │
                    │ min_stock_level │
                    │ status          │
                    │ preparation_time│
                    │ image_url       │
                    │ created_date    │
                    └─────────────────┘
                            │
                            │ N:1
                            │
                    ┌─────────────────┐
                    │    Category     │
                    ├─────────────────┤
                    │ category_id (PK)│
                    │ category_name   │
                    │ description     │
                    │ is_active       │
                    └─────────────────┘

                    ┌─────────────────┐
                    │     Staff       │
                    ├─────────────────┤
                    │ staff_id (PK)   │
                    │ name            │
                    │ role            │
                    │ email           │
                    │ phone           │
                    │ hire_date       │
                    │ salary          │
                    │ is_active       │
                    └─────────────────┘
                            │
                            │ 1:N
                            │
                    ┌─────────────────┐
                    │Inventory_Transaction│
                    ├─────────────────┤
                    │transaction_id(PK)│
                    │ item_id (FK)    │
                    │ staff_id (FK)   │
                    │ transaction_type│
                    │ quantity        │
                    │ unit_cost       │
                    │ total_cost      │
                    │ transaction_date│
                    │ notes           │
                    └─────────────────┘

                    ┌─────────────────┐
                    │  Daily_Sales    │
                    ├─────────────────┤
                    │ sale_date (PK)  │
                    │ total_orders    │
                    │ total_revenue   │
                    │ total_customers │
                    │ peak_hour       │
                    │most_sold_item_id(FK)│
                    └─────────────────┘
```

## Relationships Summary

1. **Customer ↔ Orders**: One-to-Many
   - One customer can place multiple orders
   - Each order belongs to one customer

2. **Orders ↔ Order_Details**: One-to-Many
   - One order can have multiple order details (items)
   - Each order detail belongs to one order

3. **Menu_Item ↔ Order_Details**: One-to-Many
   - One menu item can appear in multiple order details
   - Each order detail references one menu item

4. **Category ↔ Menu_Item**: One-to-Many
   - One category can contain multiple menu items
   - Each menu item belongs to one category

5. **Staff ↔ Orders**: One-to-Many
   - One staff member can process multiple orders
   - Each order is processed by one staff member

6. **Staff ↔ Inventory_Transaction**: One-to-Many
   - One staff member can perform multiple inventory transactions
   - Each inventory transaction is performed by one staff member

7. **Menu_Item ↔ Inventory_Transaction**: One-to-Many
   - One menu item can have multiple inventory transactions
   - Each inventory transaction affects one menu item

8. **Menu_Item ↔ Daily_Sales**: One-to-Many
   - One menu item can be the most sold item on multiple days
   - Each daily sales record has one most sold item

## Key Constraints

- **Primary Keys**: All entities have auto-incrementing primary keys
- **Foreign Keys**: All relationships are properly enforced with foreign key constraints
- **Unique Constraints**: Email addresses are unique for customers and staff
- **Check Constraints**: Payment status, order status, and other enums have predefined values
- **Default Values**: Most fields have appropriate default values
- **Cascade Deletes**: Order details are deleted when an order is deleted

## Business Rules Implemented

1. **Stock Management**: Stock quantities are automatically updated when orders are placed
2. **Status Management**: Menu items automatically change status based on stock levels
3. **Order Processing**: Orders can only be placed for available items
4. **Inventory Tracking**: All stock changes are logged in inventory transactions
5. **Daily Reporting**: Sales data is automatically aggregated daily
6. **Customer Types**: Different customer types (Student, Staff, Guest) are supported
7. **Staff Roles**: Different staff roles with appropriate permissions
8. **Payment Tracking**: Multiple payment methods and status tracking















