# Quick Start Guide

## Prerequisites
1. **MySQL Server** must be installed and running
2. **Python 3.8+** installed
3. Backend dependencies installed (already done in `backend/venv`)

## Setup Database

### Option 1: Using the Python tool
```powershell
cd backend
.\venv\Scripts\activate
python tools\init_db.py
```

If your MySQL root has a password:
```powershell
python tools\init_db.py --password "your_password"
```

### Option 2: Manually with MySQL
```bash
mysql -u root -p
CREATE DATABASE smart_canteen;
USE smart_canteen;
source database/schema.sql
source database/views_and_procedures.sql
```

## Start the System

### Windows - Using PowerShell (Recommended)
```powershell
.\start_canteen.ps1
```

### Cross-platform (Windows/macOS/Linux)
```bash
python start.py
```

## Access the Application

- **Frontend**: http://localhost:8000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## Test the API

```powershell
# Check health
curl http://localhost:5000/api/health

# Get menu items
curl http://localhost:5000/api/menu

# Create a customer
curl -X POST http://localhost:5000/api/customers \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","customer_type":"Student"}'
```

## Configuration

Edit `backend/.env` to change database settings:
```
DB_HOST=localhost
DB_NAME=smart_canteen
DB_USER=root
DB_PASSWORD=your_password_here
```

## Troubleshooting

### Database connection failed
1. Ensure MySQL service is running
2. Check credentials in `backend/.env`
3. Run `python tools\init_db.py` to create database

### Port already in use
- Backend (5000): Stop other apps or change port in `backend/simple_server.py`
- Frontend (8000): Stop other HTTP servers or change port in `frontend/serve.py`

### Import errors
```powershell
cd backend
.\venv\Scripts\activate
pip install -r requirements.txt
```
