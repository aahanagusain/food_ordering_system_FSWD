# Smart Canteen Ordering System

A comprehensive database-driven canteen management system that automates ordering, billing, and inventory management in real-time.

## 🚀 Features

### Core Features
- **Online Order Placement**: Customers can browse menu and place orders through web interface
- **Real-time Billing**: Automated billing with multiple payment methods
- **Inventory Management**: Real-time stock tracking and low-stock alerts
- **Customer Management**: Support for Students, Staff, and Guest customers
- **Staff Management**: Role-based access for different staff members
- **Order Tracking**: Real-time order status updates
- **Analytics & Reporting**: Comprehensive sales and inventory reports

### Technical Features
- **RESTful API**: Clean API design with proper error handling
- **Database-driven**: MySQL database with optimized queries
- **Responsive Design**: Mobile-friendly web interface
- **Real-time Updates**: Live stock and order status updates
- **Data Analytics**: Advanced reporting and analytics dashboard

## 📋 System Requirements

### Software Requirements
- **Database**: MySQL 8.0 or higher
- **Backend**: Python 3.8+
- **Frontend**: Modern web browser (Chrome, Firefox, Safari, Edge)
- **Web Server**: Simple Python HTTP server (no Flask required)

### Hardware Requirements
- **RAM**: Minimum 4GB, Recommended 8GB
- **Storage**: Minimum 10GB free space
- **Network**: Internet connection for web interface

## 🛠️ Installation Guide

### 1. Database Setup

1. **Install MySQL**
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install mysql-server

   # Windows
   # Download from https://dev.mysql.com/downloads/mysql/
   ```

2. **Create Database**
   ```sql
   mysql -u root -p
   CREATE DATABASE smart_canteen;
   ```

3. **Run Schema Scripts**
   ```bash
   mysql -u root -p smart_canteen < database/schema.sql
   mysql -u root -p smart_canteen < database/views_and_procedures.sql
   ```

### 2. Backend Setup

1. **Navigate to Backend Directory**
   ```bash
   cd backend
   ```

2. **Create Virtual Environment**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # Linux/Mac
   source venv/bin/activate
   ```

3. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment**
   ```bash
   # Copy environment template
   cp env_example.txt .env
   
   # Edit .env file with your database credentials
   DB_HOST=localhost
   DB_NAME=smart_canteen
   DB_USER=root
   DB_PASSWORD=your_password
   ```

5. **Run Backend Server**
```bash
python simple_server.py
```

### 3. Frontend Setup

1. **Navigate to Frontend Directory**
   ```bash
   cd frontend
   ```

2. **Open in Web Browser**
   ```bash
   # Simply open index.html in your web browser
   # Or use a local server
   python -m http.server 8000
   ```

3. **Access Application**
   ```
   http://localhost:8000
   ```

## 📊 Database Schema

### Core Entities

#### Customer
- `customer_id` (Primary Key)
- `name`, `email`, `phone`
- `customer_type` (Student/Staff/Guest)
- `registration_date`, `is_active`

#### Menu_Item
- `item_id` (Primary Key)
- `name`, `description`, `price`
- `category_id` (Foreign Key)
- `stock_quantity`, `min_stock_level`
- `status`, `preparation_time`

#### Orders
- `order_id` (Primary Key)
- `customer_id` (Foreign Key)
- `staff_id` (Foreign Key)
- `order_date`, `total_amount`
- `payment_status`, `order_status`
- `payment_method`

#### Order_Details
- `order_detail_id` (Primary Key)
- `order_id` (Foreign Key)
- `item_id` (Foreign Key)
- `quantity`, `unit_price`, `total_price`

#### Staff
- `staff_id` (Primary Key)
- `name`, `role`, `email`, `phone`
- `hire_date`, `salary`, `is_active`

#### Inventory_Transaction
- `transaction_id` (Primary Key)
- `item_id` (Foreign Key)
- `staff_id` (Foreign Key)
- `transaction_type`, `quantity`
- `unit_cost`, `total_cost`
- `transaction_date`, `notes`

## 🔧 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Customer Endpoints

#### Get All Customers
```http
GET /customers
```

#### Create Customer
```http
POST /customers
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "customer_type": "Student"
}
```

#### Get Customer by ID
```http
GET /customers/{customer_id}
```

### Menu Endpoints

#### Get All Menu Items
```http
GET /menu
```

#### Get Menu Item by ID
```http
GET /menu/{item_id}
```

#### Get Low Stock Items
```http
GET /menu/low-stock
```

### Order Endpoints

#### Create Order
```http
POST /orders
Content-Type: application/json

{
  "customer_id": 1,
  "items": [
    {
      "item_id": 1,
      "quantity": 2
    }
  ],
  "payment_method": "Cash"
}
```

#### Get Orders
```http
GET /orders?status=Placed&customer_id=1
```

#### Update Order Status
```http
PUT /orders/{order_id}
Content-Type: application/json

{
  "order_status": "Ready"
}
```

### Inventory Endpoints

#### Get Inventory Transactions
```http
GET /inventory/transactions?item_id=1&date_from=2024-01-01
```

#### Create Inventory Transaction
```http
POST /inventory/transactions
Content-Type: application/json

{
  "item_id": 1,
  "staff_id": 1,
  "transaction_type": "Stock_In",
  "quantity": 50,
  "unit_cost": 10.00,
  "notes": "New stock received"
}
```

#### Get Low Stock Items
```http
GET /inventory/low-stock
```

### Analytics Endpoints

#### Get Dashboard Data
```http
GET /analytics/dashboard?days=30
```

#### Get Sales Trend
```http
GET /analytics/sales-trend?period=daily&days=30
```

#### Get Category Analysis
```http
GET /analytics/category-analysis?days=30
```

## 🎯 One-click Start (Windows)

Double-click launcher:

1. Open PowerShell in the project folder and run once to create a desktop shortcut:
```
Set-Content -Path start_canteen.ps1 -Value "& \".\\backend\\venv\\Scripts\\python.exe\" start.py"
```
2. Next times, just run:
```
& ".\backend\venv\Scripts\python.exe" start.py
```

The frontend will auto-pick a free port (prefers 8000) and open your browser. Backend runs on 5000 and uses MySQL.

## 🎯 Usage Guide

### For Customers

1. **Access the System**
   - Open web browser and navigate to the application URL
   - Browse the menu by category

2. **Place an Order**
   - Click "Add to Cart" on desired items
   - Review cart and click "Proceed to Checkout"
   - Register as customer if not already registered
   - Confirm order details and place order

3. **Track Orders**
   - Click "My Orders" to view order history
   - Check order status and details

### For Staff

1. **Order Management**
   - View pending orders in the system
   - Update order status (Placed → Preparing → Ready → Completed)
   - Process payments and update payment status

2. **Inventory Management**
   - Monitor stock levels and low-stock alerts
   - Add new stock through inventory transactions
   - Update item availability and prices

3. **Reports and Analytics**
   - View daily sales reports
   - Analyze customer preferences
   - Monitor staff performance
   - Track inventory movement

### For Administrators

1. **System Management**
   - Manage customer accounts
   - Add/edit menu items and categories
   - Manage staff accounts and roles
   - Configure system settings

2. **Analytics and Reporting**
   - Generate comprehensive reports
   - Analyze sales trends and patterns
   - Monitor inventory performance
   - Track customer behavior

## 📈 Key Features Explained

### Real-time Stock Management
- Automatic stock deduction when orders are placed
- Low-stock alerts when items fall below minimum levels
- Inventory transaction logging for audit trails
- Bulk stock updates for efficient management

### Order Processing Workflow
1. **Order Placement**: Customer selects items and places order
2. **Order Confirmation**: System validates stock availability
3. **Kitchen Processing**: Staff updates order status to "Preparing"
4. **Order Ready**: Status updated to "Ready" when prepared
5. **Order Completion**: Status updated to "Completed" after delivery

### Payment Processing
- Multiple payment methods (Cash, Card, Digital Wallet, UPI)
- Payment status tracking (Pending, Paid, Failed, Refunded)
- Automatic tax calculation (5% GST)
- Receipt generation and order confirmation

### Analytics and Reporting
- **Sales Analytics**: Daily, weekly, monthly sales trends
- **Customer Analytics**: Customer segmentation and loyalty analysis
- **Inventory Analytics**: Stock movement and waste analysis
- **Staff Performance**: Order processing and efficiency metrics

## 🔒 Security Features

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CORS configuration

### Access Control
- Role-based access control
- Staff authentication
- Customer registration system
- Session management

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Error
```
Error: Can't connect to MySQL server
```
**Solution**: Check MySQL service status and credentials in .env file

#### Port Already in Use
```
Error: Port 5000 is already in use
```
**Solution**: Change port in simple_server.py or stop the process using port 5000

#### Frontend Not Loading
```
Error: CORS policy blocked
```
**Solution**: Ensure backend server is running and CORS is properly configured

### Performance Optimization

#### Database Optimization
- Use indexes on frequently queried columns
- Optimize queries with EXPLAIN
- Regular database maintenance

#### Application Optimization
- Use connection pooling
- Implement caching for frequently accessed data
- Optimize API response times

## 📞 Support

### Getting Help
- Check the troubleshooting section above
- Review API documentation for endpoint details
- Examine database schema for data relationships

### Contributing
- Follow coding standards and conventions
- Add proper error handling
- Include comprehensive comments
- Test all new features thoroughly

## 📄 License

This project is developed for educational purposes as part of a DBMS course project.

## 🎓 Project Outcomes

### Deliverables Completed
- ✅ Functional Smart Canteen Ordering System prototype
- ✅ Database schema, ER diagram, and SQL scripts
- ✅ Comprehensive documentation and user guide
- ✅ Analytics reports (top items, peak hours, revenue)
- ✅ Web-based customer interface
- ✅ RESTful API for all operations
- ✅ Inventory management system
- ✅ Real-time reporting and analytics

### Technical Achievements
- **Database Design**: Normalized relational database with proper relationships
- **API Development**: RESTful API with comprehensive error handling
- **Frontend Development**: Responsive web interface with modern UI/UX
- **Real-time Features**: Live stock updates and order tracking
- **Analytics**: Advanced reporting and data visualization
- **Documentation**: Complete system documentation and user guides

### Business Value
- **Efficiency**: Reduced waiting time and improved service quality
- **Automation**: Automated ordering, billing, and inventory management
- **Insights**: Better management insights through analytics
- **Scalability**: System can handle multiple customers and orders
- **User Experience**: Intuitive interface for both customers and staff

