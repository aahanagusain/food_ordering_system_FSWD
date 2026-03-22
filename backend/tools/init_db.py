"""
Initialize Smart Canteen MySQL database using bundled SQL files.
- Reads DB config from backend/.env (or defaults)
- Connects to MySQL server
- Creates database if missing
- Executes schema.sql and views_and_procedures.sql
- Optionally loads sample data if present inside schema.sql

Usage:
  python tools/init_db.py --host localhost --user root --password "" --db smart_canteen
  # Or rely on .env values

Requires: mysql-connector-python
"""

import os
import argparse
from pathlib import Path
from dotenv import load_dotenv
import mysql.connector
from mysql.connector import Error

ROOT = Path(__file__).resolve().parents[1]
DB_DIR = ROOT.parent / 'database'

SCHEMA_FILE = DB_DIR / 'schema.sql'
VIEWS_FILE = DB_DIR / 'views_and_procedures.sql'

load_dotenv(ROOT / '.env')

def read_sql(path: Path) -> str:
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()


def connect_server(host: str, user: str, password: str):
    # Add short connection timeout to avoid hangs
    return mysql.connector.connect(
        host=host,
        user=user,
        password=password,
        connection_timeout=5,
    )


def connect_db(host: str, user: str, password: str, database: str):
    # Add short connection timeout to avoid hangs when selecting DB
    return mysql.connector.connect(
        host=host,
        user=user,
        password=password,
        database=database,
        connection_timeout=5,
    )


def ensure_database(host: str, user: str, password: str, database: str):
    conn = connect_server(host, user, password)
    try:
        cur = conn.cursor()
        cur.execute(f"CREATE DATABASE IF NOT EXISTS `{database}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
        conn.commit()
    finally:
        cur.close()
        conn.close()


def exec_sql_file(conn, sql_text: str, label: str):
    cur = conn.cursor()
    try:
        # mysql-connector cannot execute multi-statement by default with ;, so split manually
        statements = [s.strip() for s in sql_text.split(';') if s.strip()]
        for idx, stmt in enumerate(statements, 1):
            try:
                cur.execute(stmt)
            except Error as e:
                # Some CREATE VIEW/PROC may require DELIMITER blocks; for simplicity, skip lines we can't run
                print(f"[WARN] {label} statement {idx} failed: {e}")
        conn.commit()
    finally:
        cur.close()


def _table_exists(conn, table_name: str) -> bool:
    try:
        cur = conn.cursor()
        try:
            cur.execute("SHOW TABLES LIKE %s", (table_name,))
            return cur.fetchone() is not None
        finally:
            cur.close()
    except Error:
        return False


def database_seeded(conn) -> bool:
    """Return True if Menu_Item exists and has rows. Safe & fast check."""
    if not _table_exists(conn, 'Menu_Item'):
        return False
    try:
        cur = conn.cursor()
        try:
            cur.execute("SELECT COUNT(*) FROM Menu_Item")
            count = cur.fetchone()[0]
            return bool(count and int(count) > 0)
        finally:
            cur.close()
    except Error:
        return False


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--host', default=os.getenv('DB_HOST', 'localhost'))
    parser.add_argument('--user', default=os.getenv('DB_USER', 'root'))
    parser.add_argument('--password', default=os.getenv('DB_PASSWORD', ''))
    parser.add_argument('--db', default=os.getenv('DB_NAME', 'smart_canteen'))
    args = parser.parse_args()

    # Pre-flight checks
    if not SCHEMA_FILE.exists():
        print(f"[ERROR] Missing schema file: {SCHEMA_FILE}")
        return 1
    if not VIEWS_FILE.exists():
        print(f"[ERROR] Missing views/procedures file: {VIEWS_FILE}")
        return 1

    try:
        print(f"[INFO] Ensuring database `{args.db}` exists on {args.host}...")
        ensure_database(args.host, args.user, args.password, args.db)
        print("[OK] Database ensured.")

        print("[INFO] Connecting to database...")
        conn = connect_db(args.host, args.user, args.password, args.db)
        try:
            if database_seeded(conn):
                print("[INFO] Existing data detected in Menu_Item. Skipping schema reseed.")
            else:
                print(f"[INFO] Executing {SCHEMA_FILE.name} (fresh seed)...")
                exec_sql_file(conn, read_sql(SCHEMA_FILE), 'schema.sql')

            print(f"[INFO] Executing {VIEWS_FILE.name}...")
            exec_sql_file(conn, read_sql(VIEWS_FILE), 'views_and_procedures.sql')
        finally:
            conn.close()

        print("[SUCCESS] Database initialized.")
        return 0
    except Error as e:
        print(f"[ERROR] MySQL error: {e}")
        print("[HINT] Ensure MySQL Server is installed, running, and credentials in backend/.env are correct.")
        return 2

if __name__ == '__main__':
    raise SystemExit(main())
