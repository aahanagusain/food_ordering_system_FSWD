"""
Update existing orders in MySQL database with correct discounted totals.
This script recalculates discounts for all existing orders and updates the total_amount field.

Usage:
  python tools/update_order_totals.py
  # Uses DB config from backend/.env or defaults

Requires: mysql-connector-python
"""

import os
from pathlib import Path
from dotenv import load_dotenv
import mysql.connector
from mysql.connector import Error

ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / '.env')

TAX_RATE = 0.05

def _cart_discount(subtotal):
    """Calculate auto discount based on subtotal (same logic as services.py)"""
    subtotal = max(float(subtotal or 0), 0.0)
    best = 0.0
    
    # Cart discount coupons (same as in services.py)
    cart_coupons = [
        {"code": "CART10OFF50", "min_subtotal": 50.0, "amount_off": 10.0, "active": True},
        {"code": "CART30OFF100", "min_subtotal": 100.0, "amount_off": 30.0, "active": True},
        {"code": "CART60OFF200", "min_subtotal": 200.0, "amount_off": 60.0, "active": True},
    ]
    
    # Check active cart coupons
    for c in cart_coupons:
        if c.get('active') and subtotal >= float(c.get('min_subtotal') or 0):
            amount = float(c.get('amount_off') or 0)
            if amount > 0:
                best = max(best, min(amount, subtotal))
    
    # Auto discount fallback (if no coupon matches)
    if best == 0.0 and subtotal > 0:
        if subtotal >= 200:
            best = 60.0
        elif subtotal >= 100:
            best = 30.0
        elif subtotal >= 50:
            best = 10.0
    
    return round(best, 2)


def update_orders(host, user, password, database):
    """Update all orders with correct discounted totals"""
    try:
        conn = mysql.connector.connect(
            host=host,
            user=user,
            password=password,
            database=database,
            connection_timeout=5,
        )
        
        cur = conn.cursor(dictionary=True)
        
        # Get all orders with their subtotals
        query = """
            SELECT o.order_id, 
                   COALESCE(SUM(od.quantity * od.unit_price), 0) as subtotal,
                   o.total_amount as old_total
            FROM Orders o
            LEFT JOIN Order_Details od ON o.order_id = od.order_id
            GROUP BY o.order_id, o.total_amount
            ORDER BY o.order_id
        """
        
        cur.execute(query)
        orders = cur.fetchall()
        
        if not orders:
            print("[INFO] No orders found in database.")
            return 0
        
        print(f"[INFO] Found {len(orders)} orders to update.")
        
        updated_count = 0
        for order in orders:
            order_id = order['order_id']
            subtotal = float(order['subtotal'] or 0)
            old_total = float(order['old_total'] or 0)
            
            # Calculate discount
            discount = _cart_discount(subtotal)
            taxable = max(0.0, round(subtotal - discount, 2))
            tax = round(taxable * TAX_RATE, 2)
            new_total = round(taxable + tax, 2)
            
            # Only update if total changed
            if abs(old_total - new_total) > 0.01:
                update_query = "UPDATE Orders SET total_amount = %s WHERE order_id = %s"
                cur.execute(update_query, (new_total, order_id))
                updated_count += 1
                print(f"[UPDATE] Order #{order_id}: ₹{old_total:.2f} → ₹{new_total:.2f} (Subtotal: ₹{subtotal:.2f}, Discount: ₹{discount:.2f}, Tax: ₹{tax:.2f})")
            else:
                print(f"[SKIP] Order #{order_id}: Already correct (₹{old_total:.2f})")
        
        conn.commit()
        cur.close()
        conn.close()
        
        print(f"\n[SUCCESS] Updated {updated_count} out of {len(orders)} orders.")
        return 0
        
    except Error as e:
        print(f"[ERROR] MySQL error: {e}")
        return 1


def main():
    host = os.getenv('DB_HOST', 'localhost')
    user = os.getenv('DB_USER', 'root')
    password = os.getenv('DB_PASSWORD', '')
    database = os.getenv('DB_NAME', 'smart_canteen')
    
    print(f"[INFO] Connecting to database `{database}` on {host}...")
    print("[INFO] This will update all orders with correct discounted totals.\n")
    
    result = update_orders(host, user, password, database)
    
    if result == 0:
        print("\n[SUCCESS] All orders updated successfully!")
        print("[INFO] Check phpMyAdmin to verify the updated total_amount values.")
    else:
        print("\n[ERROR] Failed to update orders.")
    
    return result


if __name__ == '__main__':
    raise SystemExit(main())

