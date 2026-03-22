#!/usr/bin/env python3
"""Convenience launcher for the Smart Canteen project."""
from __future__ import annotations
import os, subprocess, sys, threading, time, webbrowser
from http.server import SimpleHTTPRequestHandler
from pathlib import Path
from socketserver import ThreadingTCPServer

ROOT = Path(__file__).resolve().parent
BACKEND = ROOT / 'backend'
FRONTEND = ROOT / 'frontend'

def _maybe_reexec():
    candidates = [ROOT / '.venv' / 'Scripts' / 'python.exe', BACKEND / 'venv' / 'Scripts' / 'python.exe', BACKEND / 'Scripts' / 'python.exe']
    for interpreter in candidates:
        if interpreter.exists() and Path(sys.executable).resolve() != interpreter.resolve():
            print(f'[INFO] Switching to virtual environment: {interpreter}')
            print('[INFO] Checking requirements...')
            subprocess.call([str(interpreter), '-m', 'pip', 'install', '-r', str(BACKEND / 'requirements.txt')], stdout=subprocess.DEVNULL)
            subprocess.call([str(interpreter), str(Path(__file__).resolve())])
            raise SystemExit(0)

def _write_env():
    env_file = BACKEND / '.env'
    if env_file.exists():
        return
    env_file.parent.mkdir(parents=True, exist_ok=True)
    env_file.write_text('DB_HOST=localhost\nDB_NAME=smart_canteen\nDB_USER=root\nDB_PASSWORD=\nDB_PORT=3306\nUSE_MYSQL=true\n', encoding='utf-8')
    print(f'[OK] Created default environment file at {env_file}')

def _run_helper(script: Path, label: str):
    if not script.exists():
        print(f'[WARN] Skipping {label}: {script.name} not found')
        return
    try:
        result = subprocess.call([sys.executable, str(script)])
        status = 'OK' if result == 0 else 'WARN'
        print(f'[{status}] {label} finished with code {result}')
    except Exception as exc:
        print(f'[WARN] {label} failed: {exc}')

def _start_backend():
    from backend.simple_server import run
    run(host='0.0.0.0', port=5000)

def _start_frontend(preferred_ports=(8000, 8001, 8080, 3000)):
    os.chdir(FRONTEND)
    class Handler(SimpleHTTPRequestHandler):
        def log_message(self, *args, **kwargs):
            pass
    ThreadingTCPServer.allow_reuse_address = True
    server = None
    bound_port = None
    for port in preferred_ports:
        try:
            server = ThreadingTCPServer(('', port), Handler)
            bound_port = port
            break
        except OSError:
            continue
    if server is None:
        print('[ERROR] Could not start frontend server; all candidate ports are busy.')
        return
    url = f'http://localhost:{bound_port}'
    print(f'[OK] Frontend available at {url}')
    try:
        webbrowser.open(url)
    except Exception:
        pass
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()

def main():
    _maybe_reexec()
    _write_env()
    _run_helper(BACKEND / 'tools' / 'init_db.py', 'Database initialisation')
    _run_helper(BACKEND / 'tools' / 'cleanup_duplicates.py', 'Duplicate cleanup')
    backend_thread = threading.Thread(target=_start_backend, daemon=True)
    frontend_thread = threading.Thread(target=_start_frontend, daemon=True)
    backend_thread.start()
    time.sleep(0.5)
    frontend_thread.start()
    print('[OK] Backend running on http://localhost:5000')
    try:
        while backend_thread.is_alive() and frontend_thread.is_alive():
            time.sleep(1)
    except KeyboardInterrupt:
        print('\n[INFO] Shutting down...')

if __name__ == '__main__':
    main()
