#!/usr/bin/env python3
"""
Direct MySQL test - creates orders and shows what's in phpMyAdmin.
Run this to verify the database connection works properly.
"""

import mysql.connector
from datetime import datetime

def test_mysql_connection():
    print("Testing MySQL connection...")
    
    try:
        # Connect to MySQL
        conn = mysql.connector.connect(
            host='localhost',
            database='smart_canteen',
            user='root',
            password='',  # Change if you have a password
            port=3306
        )
        print("Connected to MySQL successfully!")
        
        cursor = conn.cursor()
        
        # Check existing data
        print("\nCurrent data in database:")
        
        # Check customers
        cursor.execute("SELECT COUNT(*) FROM Customer")
        customer_count = cursor.fetchone()[0]
        print(f"   Customers: {customer_count}")
        
        # Check orders
        cursor.execute("SELECT COUNT(*) FROM Orders")
        order_count = cursor.fetchone()[0]
        print(f"   Orders: {order_count}")
        
        # Check order details
        cursor.execute("SELECT COUNT(*) FROM Order_Details")
        detail_count = cursor.fetchone()[0]
        print(f"   Order Details: {detail_count}")
        
        # Show recent orders
        print("\nRecent orders:")
        cursor.execute("""
            SELECT o.order_id, o.customer_id, o.total_amount, o.order_date, o.order_status
            FROM Orders o 
            ORDER BY o.order_date DESC 
            LIMIT 5
        """)
        orders = cursor.fetchall()
        for order in orders:
            print(f"   Order {order[0]}: Customer {order[1]}, Amount Rs{order[2]}, Date {order[3]}, Status {order[4]}")
        
        # Create a test order
        print("\nCreating test order...")
        
        # Get first customer
        cursor.execute("SELECT customer_id FROM Customer LIMIT 1")
        customer_id = cursor.fetchone()[0]
        
        # Get first menu item
        cursor.execute("SELECT item_id, price FROM Menu_Item LIMIT 1")
        item_id, price = cursor.fetchone()
        
        # Insert order
        cursor.execute("""
            INSERT INTO Orders (customer_id, total_amount, payment_status, order_status, payment_method)
            VALUES (%s, %s, %s, %s, %s)
        """, (customer_id, price, 'Paid', 'Completed', 'Cash'))
        
        order_id = cursor.lastrowid
        
        # Insert order detail
        cursor.execute("""
            INSERT INTO Order_Details (order_id, item_id, quantity, unit_price, total_price)
            VALUES (%s, %s, %s, %s, %s)
        """, (order_id, item_id, 1, price, price))
        
        conn.commit()
        print(f"Test order created! Order ID: {order_id}")
        
        # Show updated counts
        cursor.execute("SELECT COUNT(*) FROM Orders")
        new_order_count = cursor.fetchone()[0]
        print(f"   New order count: {new_order_count}")
        
        print("\nSUCCESS! Check phpMyAdmin now:")
        print("   1. Go to http://localhost/phpmyadmin")
        print("   2. Select 'smart_canteen' database")
        print("   3. Click 'orders' table")
        print("   4. Click 'Refresh' button")
        print(f"   5. You should see order ID {order_id}")
        
        cursor.close()
        conn.close()
        
    except mysql.connector.Error as e:
        print(f"MySQL Error: {e}")
        print("\nTroubleshooting:")
        print("   1. Make sure MySQL is running (XAMPP Control Panel)")
        print("   2. Check if password is needed (update line 20)")
        print("   3. Verify database 'smart_canteen' exists")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_mysql_connection()
