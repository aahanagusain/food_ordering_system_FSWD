#!/usr/bin/env python3
"""
Create a guaranteed test order directly in MySQL so you can verify in phpMyAdmin.

Usage (PowerShell):
  & ".\backend\venv\Scripts\python.exe" backend\tools\make_test_order.py

The script will:
  - Connect to DB using backend/.env or defaults
  - Ensure at least one customer exists (create one if needed)
  - Pick the first available menu item
  - Insert a new order and one order_detail
  - Print the new order_id
"""

from __future__ import annotations

import os
from typing import Optional, Tuple

try:
    from dotenv import load_dotenv
except Exception:  # pragma: no cover
    def load_dotenv(*args, **kwargs):  # type: ignore
        return False

import mysql.connector  # type: ignore
from mysql.connector import Error  # type: ignore


ROOT = os.path.dirname(os.path.dirname(__file__))
load_dotenv(os.path.join(ROOT, '.env'))


def get_conn():
    cfg = {
        'host': os.getenv('DB_HOST', 'localhost'),
        'database': os.getenv('DB_NAME', 'smart_canteen'),
        'user': os.getenv('DB_USER', 'root'),
        'password': os.getenv('DB_PASSWORD', ''),
        'charset': 'utf8mb4',
    }
    return mysql.connector.connect(**cfg)


def ensure_customer(cur) -> int:
    cur.execute("SELECT customer_id FROM Customer ORDER BY customer_id LIMIT 1")
    row = cur.fetchone()
    if row:
        return int(row[0])
    # create a default customer
    cur.execute(
        """
        INSERT INTO Customer (name, email, phone, customer_type)
        VALUES (%s, %s, %s, %s)
        """,
        ("Test User", "autotest@example.com", "", "Student")
    )
    return int(cur.lastrowid or 0)


def get_first_menu_item(cur) -> Tuple[int, float, str]:
    cur.execute("SELECT item_id, price, name FROM Menu_Item ORDER BY item_id LIMIT 1")
    row = cur.fetchone()
    if not row:
        raise RuntimeError("No menu items found in Menu_Item table.")
    item_id = int(row[0])
    price = float(row[1])
    name = str(row[2])
    return item_id, price, name


def main() -> int:
    try:
        conn = get_conn()
    except Error as e:
        print(f"[ERROR] Failed to connect to MySQL: {e}")
        return 2

    try:
        cur = conn.cursor()

        customer_id = ensure_customer(cur)
        item_id, price, _ = get_first_menu_item(cur)

        total_amount = round(price * 1, 2)
        cur.execute(
            """
            INSERT INTO Orders (customer_id, total_amount, payment_status, order_status, payment_method)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (customer_id, total_amount, 'Paid', 'Completed', 'Cash')
        )
        order_id = int(cur.lastrowid or 0)

        cur.execute(
            """
            INSERT INTO Order_Details (order_id, item_id, quantity, unit_price, total_price)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (order_id, item_id, 1, price, total_amount)
        )

        conn.commit()
        cur.close()
        conn.close()
        print(f"[OK] Test order created successfully. order_id={order_id}")
        return 0
    except Error as e:  # pragma: no cover
        try:
            conn.rollback()
            conn.close()
        except Exception:
            pass
        print(f"[ERROR] MySQL error: {e}")
        return 3


if __name__ == '__main__':
    raise SystemExit(main())


