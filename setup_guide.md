# Smart Canteen Ordering System - Setup Guide

## Quick Start Guide

This guide will help you set up and run the Smart Canteen Ordering System on your local machine.

## Prerequisites

### Software Requirements
- **Python 3.8 or higher**
- **MySQL 8.0 or higher**
- **Web browser** (Chrome, Firefox, Safari, Edge)
- **Git** (optional, for cloning repository)

### System Requirements
- **RAM**: Minimum 4GB, Recommended 8GB
- **Storage**: At least 2GB free space
- **Operating System**: Windows, macOS, or Linux

## Installation Steps

### Step 1: Database Setup

#### Install MySQL
**Windows:**
1. Download MySQL from https://dev.mysql.com/downloads/mysql/
2. Run the installer and follow the setup wizard
3. Remember the root password you set

**macOS:**
```bash
# Using Homebrew
brew install mysql
brew services start mysql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

#### Create Database
1. Open MySQL command line or MySQL Workbench
2. Connect as root user
3. Run the following commands:

```sql
CREATE DATABASE smart_canteen;
USE smart_canteen;
```

#### Import Database Schema
1. Navigate to the project directory
2. Run the following commands:

```bash
# Import schema
mysql -u root -p smart_canteen < database/schema.sql

# Import views and procedures
mysql -u root -p smart_canteen < database/views_and_procedures.sql
```

### Step 2: Backend Setup

#### Navigate to Backend Directory
```bash
cd backend
```

#### Create Virtual Environment
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
```

#### Install Dependencies
```bash
pip install -r requirements.txt
```

#### Configure Environment
1. Copy the environment template:
```bash
# Windows
copy env_example.txt .env

# macOS/Linux
cp env_example.txt .env
```

2. Edit the `.env` file with your database credentials:
```
DB_HOST=localhost
DB_NAME=smart_canteen
DB_USER=root
DB_PASSWORD=your_mysql_password
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your_secret_key_here
```

#### Start Backend Server
```bash
python simple_server.py
```

The backend server will start on `http://localhost:5000`

### Step 3: Frontend Setup

#### Navigate to Frontend Directory
```bash
cd frontend
```

#### Start Local Server (Optional)
```bash
# Using Python's built-in server
python -m http.server 8000

# Or simply open index.html in your browser
```

#### Access the Application
Open your web browser and navigate to:
- **With local server**: `http://localhost:8000`
- **Direct file**: Open `index.html` in your browser

## Verification

### Test Database Connection
1. The backend server should start without errors
2. Check the console for "Database connection successful" message
3. Visit `http://localhost:5000/api/health` to verify API is working

### Test Frontend
1. Open the web application in your browser
2. You should see the Smart Canteen homepage
3. Try browsing the menu items
4. Test adding items to cart

### Test Sample Data
The system comes with sample data including:
- Sample customers (Students, Staff, Guests)
- Sample menu items across all categories
- Sample staff members with different roles

## Common Issues and Solutions

### Database Connection Issues

**Error**: `Can't connect to MySQL server`
**Solutions**:
1. Ensure MySQL service is running
2. Check if the password in `.env` file is correct
3. Verify database name is `smart_canteen`
4. Try connecting to MySQL manually to test credentials

**Error**: `Access denied for user 'root'@'localhost'`
**Solutions**:
1. Reset MySQL root password
2. Create a new MySQL user with proper permissions
3. Update the `.env` file with correct credentials

### Backend Issues

**Error**: `Port 5000 is already in use`
**Solutions**:
1. Stop the process using port 5000:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # macOS/Linux
   lsof -ti:5000 | xargs kill -9
   ```
2. Or change the port in `backend/simple_server.py`

**Note**: The simplified server does not require Flask.

### Frontend Issues

**Error**: `CORS policy blocked`
**Solutions**:
1. Ensure backend server is running on port 5000
2. Check if API endpoints are accessible
3. Verify CORS configuration in backend

**Error**: `Menu items not loading`
**Solutions**:
1. Check browser console for errors
2. Verify backend API is responding
3. Check network tab for failed requests

## Sample Data

The system includes the following sample data:

### Customers
- Arjun Mehta (Student)
- Kavya Reddy (Student)
- Dr. Suresh Kumar (Staff)
- Prof. Meera Joshi (Staff)
- Guest User (Guest)

### Menu Items
- **Beverages**: Masala Chai, Coffee, Cold Coffee, Orange Juice
- **Snacks**: Samosa, Vada Pav, Poha, Sandwich
- **Main Course**: Dal Rice, Rajma Rice, Chole Bhature, Biryani
- **Desserts**: Gulab Jamun, Ice Cream, Kheer
- **Breakfast**: Idli Sambar, Dosa, Paratha

### Staff Members
- Rajesh Kumar (Manager)
- Priya Sharma (Chef)
- Amit Singh (Cashier)
- Sneha Patel (Chef)

## Testing the System

### Basic Functionality Test
1. **Browse Menu**: Navigate through different categories
2. **Add to Cart**: Add items to shopping cart
3. **Register Customer**: Create a new customer account
4. **Place Order**: Complete the checkout process
5. **View Orders**: Check order history

### Advanced Features Test
1. **Inventory Management**: Check low stock items
2. **Order Processing**: Update order status
3. **Analytics**: View sales reports and analytics
4. **Staff Management**: Test different staff roles

## API Testing

### Using Browser
Visit these URLs to test API endpoints:
- `http://localhost:5000/api/health` - Health check
- `http://localhost:5000/api/customers` - List customers
- `http://localhost:5000/api/menu` - List menu items
- `http://localhost:5000/api/orders` - List orders

### Using curl
```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test menu endpoint
curl http://localhost:5000/api/menu

# Create a customer
curl -X POST http://localhost:5000/api/customers \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","customer_type":"Student"}'
```

## Next Steps

### For Development
1. **Explore the Code**: Review the codebase structure
2. **Run Tests**: Execute the sample queries in `database/sample_queries.sql`
3. **Modify Features**: Experiment with adding new features
4. **Customize UI**: Modify the frontend design and layout

### For Production
1. **Security**: Implement proper security measures
2. **Performance**: Optimize for production workloads
3. **Monitoring**: Set up logging and monitoring
4. **Backup**: Implement database backup strategy

## Support

### Getting Help
1. **Check Logs**: Review backend console output for errors
2. **Database Queries**: Use the sample queries for testing
3. **Documentation**: Refer to the comprehensive documentation
4. **Troubleshooting**: Follow the troubleshooting guide

### Common Commands
```bash
# Start backend server
cd backend
python app.py

# Check database connection
mysql -u root -p smart_canteen

# View sample data
mysql -u root -p smart_canteen -e "SELECT * FROM Customer;"

# Reset database (if needed)
mysql -u root -p -e "DROP DATABASE smart_canteen; CREATE DATABASE smart_canteen;"
mysql -u root -p smart_canteen < database/schema.sql
mysql -u root -p smart_canteen < database/views_and_procedures.sql
```

## System Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Web UI)      │◄──►│   (Flask API)   │◄──►│   (MySQL)       │
│   Port: 8000    │    │   Port: 5000    │    │   Port: 3306    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

The system consists of three main components:
1. **Frontend**: Web interface for customers
2. **Backend**: RESTful API server
3. **Database**: MySQL database with sample data

## File Structure

```
smart-canteen-system/
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── order_system.py        # Order management module
│   ├── inventory_system.py    # Inventory management module
│   ├── analytics_system.py    # Analytics and reporting module
│   ├── requirements.txt       # Python dependencies
│   └── env_example.txt        # Environment variables template
├── frontend/
│   ├── index.html            # Main web page
│   ├── styles.css            # Custom styles
│   └── script.js             # Frontend JavaScript
├── database/
│   ├── schema.sql            # Database schema
│   ├── views_and_procedures.sql # Views and stored procedures
│   └── sample_queries.sql    # Sample SQL queries
├── docs/
│   ├── ER_Diagram.md         # Entity relationship diagram
│   ├── User_Guide.md         # User documentation
│   ├── Technical_Documentation.md # Technical details
│   └── Project_Report.md     # Project report
└── README.md                 # Main documentation
```

---

**Congratulations!** You have successfully set up the Smart Canteen Ordering System. The system is now ready for use and further development.





