"""
Cleanup duplicate categories and menu items to prevent repeating dishes.

This script:
- Deduplicates Category by category_name (keeps lowest category_id)
- Repoints Menu_Item.category_id to the kept Category IDs
- Deduplicates Menu_Item by (name, category_id) (keeps lowest item_id)
- Optionally aggregates stock quantities into the kept item
- Repoints Order_Details.item_id to the kept Menu_Item IDs
- Adds UNIQUE constraints to avoid future duplicates

Configuration is read from backend/.env if present (DB_* vars),
falling back to typical XAMPP defaults.
"""

from __future__ import annotations

import os
import sys
from typing import Dict, List, Tuple

try:
    from dotenv import load_dotenv  # type: ignore
except Exception:
    load_dotenv = None  # type: ignore

import mysql.connector  # type: ignore
from mysql.connector import Error  # type: ignore


def load_env() -> None:
    # Load ../.env relative to this file (located in backend/tools)
    backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    env_path = os.path.join(backend_dir, '.env')
    if load_dotenv:
        if os.path.exists(env_path):
            load_dotenv(env_path)
        else:
            load_dotenv()


def connect_db():
    return mysql.connector.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        database=os.getenv('DB_NAME', 'smart_canteen'),
        user=os.getenv('DB_USER', 'root'),
        password=os.getenv('DB_PASSWORD', ''),
        port=int(os.getenv('DB_PORT', '3306')),
    )


def fetch_duplicates_category(cur) -> List[Tuple[str, int, List[int]]]:
    cur.execute(
        """
        SELECT category_name, MIN(category_id) AS keep_id,
               GROUP_CONCAT(category_id) AS all_ids
        FROM Category
        GROUP BY category_name
        HAVING COUNT(*) > 1
        """
    )
    results = []
    for name, keep_id, all_ids in cur.fetchall() or []:
        ids = [int(x) for x in str(all_ids).split(',') if int(x) != int(keep_id)]
        if ids:
            results.append((name, int(keep_id), ids))
    return results


def fetch_duplicates_menu_items(cur) -> List[Tuple[str, int, int, List[int]]]:
    cur.execute(
        """
        SELECT name, category_id, MIN(item_id) AS keep_id,
               GROUP_CONCAT(item_id) AS all_ids
        FROM Menu_Item
        GROUP BY name, category_id
        HAVING COUNT(*) > 1
        """
    )
    results = []
    for name, category_id, keep_id, all_ids in cur.fetchall() or []:
        ids = [int(x) for x in str(all_ids).split(',') if int(x) != int(keep_id)]
        if ids:
            results.append((str(name), int(category_id), int(keep_id), ids))
    return results


def sum_stock_for_items(cur, item_ids: List[int]) -> int:
    if not item_ids:
        return 0
    ph = ','.join(['%s'] * len(item_ids))
    cur.execute(f"SELECT COALESCE(SUM(stock_quantity),0) FROM Menu_Item WHERE item_id IN ({ph})", tuple(item_ids))
    val = cur.fetchone()[0]
    return int(val or 0)


def add_unique_constraints(cur) -> None:
    # Add unique keys if not present; ignore errors if they already exist
    try:
        cur.execute("ALTER TABLE Category ADD UNIQUE KEY uniq_category_name (category_name)")
    except Error:
        pass
    try:
        cur.execute("ALTER TABLE Menu_Item ADD UNIQUE KEY uniq_menu_name_category (name, category_id)")
    except Error:
        pass


def cleanup_duplicates() -> int:
    load_env()
    try:
        conn = connect_db()
    except Error as e:
        print(f"[CLEANUP] MySQL connect error: {e}")
        return 2

    try:
        cur = conn.cursor()

        # 1) Deduplicate Category
        cat_dups = fetch_duplicates_category(cur)
        for name, keep_id, dup_ids in cat_dups:
            # Repoint Menu_Item to kept category
            if dup_ids:
                ph = ','.join(['%s'] * len(dup_ids))
                cur.execute(f"UPDATE Menu_Item SET category_id = %s WHERE category_id IN ({ph})", (keep_id, *dup_ids))
                # Delete duplicate categories
                cur.execute(f"DELETE FROM Category WHERE category_id IN ({ph})", tuple(dup_ids))

        # 2) Deduplicate Menu_Item by (name, category_id)
        mi_dups = fetch_duplicates_menu_items(cur)
        for name, category_id, keep_id, dup_ids in mi_dups:
            if not dup_ids:
                continue
            # Sum stock from duplicates and add to kept item
            add_stock = sum_stock_for_items(cur, dup_ids)
            if add_stock:
                cur.execute("UPDATE Menu_Item SET stock_quantity = stock_quantity + %s WHERE item_id = %s", (add_stock, keep_id))
            # Repoint Order_Details.item_id
            ph = ','.join(['%s'] * len(dup_ids))
            cur.execute(f"UPDATE Order_Details SET item_id = %s WHERE item_id IN ({ph})", (keep_id, *dup_ids))
            # Delete duplicate menu items
            cur.execute(f"DELETE FROM Menu_Item WHERE item_id IN ({ph})", tuple(dup_ids))

        # 3) Add unique constraints to prevent future duplicates
        add_unique_constraints(cur)

        conn.commit()
        print("[CLEANUP] Duplicate cleanup complete.")
        return 0
    except Error as e:
        try:
            conn.rollback()
        except Exception:
            pass
        print(f"[CLEANUP] Error during cleanup: {e}")
        return 1
    finally:
        try:
            cur.close()
            conn.close()
        except Exception:
            pass


if __name__ == '__main__':
    sys.exit(cleanup_duplicates())


