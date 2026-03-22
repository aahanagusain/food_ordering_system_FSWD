# Smart Canteen Ordering System - User Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Customer Guide](#customer-guide)
3. [Staff Guide](#staff-guide)
4. [Administrator Guide](#administrator-guide)
5. [Troubleshooting](#troubleshooting)
6. [FAQ](#faq)

## Getting Started

### System Overview
The Smart Canteen Ordering System is a web-based application that allows customers to place orders online, staff to manage orders and inventory, and administrators to monitor system performance.

### Accessing the System
1. Open your web browser (Chrome, Firefox, Safari, or Edge)
2. Navigate to the application URL (typically `http://localhost:8000`)
3. The system will load the main interface

### System Requirements
- Modern web browser with JavaScript enabled
- Internet connection
- Screen resolution: 1024x768 or higher (recommended)

---

## Customer Guide

### Registration and Login

#### First Time Users
1. Click on any menu item to add to cart
2. When you proceed to checkout, you'll be prompted to register
3. Fill in the registration form:
   - **Full Name**: Your complete name
   - **Email**: Valid email address (required)
   - **Phone**: Contact number (optional)
   - **Customer Type**: Select Student, Staff, or Guest
4. Click "Register" to create your account
5. Your information will be saved for future orders

#### Returning Customers
- Your information is automatically saved
- No need to re-register for future orders

### Browsing the Menu

#### Menu Categories
The menu is organized into categories:
- **Beverages**: Hot and cold drinks
- **Snacks**: Quick bites and light snacks
- **Main Course**: Heavy meals and main dishes
- **Desserts**: Sweet treats and desserts
- **Breakfast**: Morning meals and breakfast items

#### Filtering Menu Items
1. Use the category buttons at the top of the menu
2. Click "All Items" to see everything
3. Click specific categories to filter items

#### Menu Item Information
Each menu item displays:
- **Name**: Item name
- **Category**: Which category it belongs to
- **Description**: Brief description of the item
- **Price**: Cost per unit
- **Stock Status**: Availability (In Stock, Low Stock, Out of Stock)
- **Preparation Time**: Estimated time to prepare

### Placing an Order

#### Adding Items to Cart
1. Browse the menu and find desired items
2. Click "Add to Cart" button on any available item
3. Items will be added to your cart automatically
4. You can see the cart count in the navigation bar

#### Managing Your Cart
1. Click "Cart" in the navigation bar to view your items
2. In the cart, you can:
   - **Increase Quantity**: Click the "+" button
   - **Decrease Quantity**: Click the "-" button
   - **Remove Item**: Click the trash icon
3. The cart shows:
   - Item details and prices
   - Quantity controls
   - Subtotal, tax, and total amount

#### Checkout Process
1. Review your cart items and quantities
2. Click "Proceed to Checkout"
3. If not registered, complete the registration form
4. Review order summary in the confirmation modal
5. Click "Confirm Order" to place your order
6. You'll receive an order confirmation with order ID

### Tracking Your Orders

#### Viewing Order History
1. Click "My Orders" in the navigation bar
2. View all your past orders with:
   - Order ID and date
   - Items ordered
   - Total amount
   - Order status (Placed, Preparing, Ready, Completed)
   - Payment status

#### Order Status Meanings
- **Placed**: Order received and confirmed
- **Preparing**: Kitchen is preparing your order
- **Ready**: Order is ready for pickup/delivery
- **Completed**: Order has been delivered/completed
- **Cancelled**: Order was cancelled

### Payment Information

#### Payment Methods
The system supports multiple payment methods:
- **Cash**: Pay when you receive your order
- **Card**: Credit/Debit card payment
- **Digital Wallet**: Mobile wallet payments
- **UPI**: Unified Payments Interface

#### Payment Status
- **Pending**: Payment not yet processed
- **Paid**: Payment completed successfully
- **Failed**: Payment processing failed
- **Refunded**: Payment was refunded

---

## Staff Guide

### Accessing Staff Functions
Staff members have access to additional features through the backend API. Contact your administrator for staff account setup.

### Order Management

#### Viewing Pending Orders
1. Access the orders endpoint: `/api/orders/pending`
2. View all orders with status "Placed" or "Preparing"
3. Orders are sorted by time (oldest first)

#### Updating Order Status
1. Find the order you want to update
2. Use the API endpoint: `PUT /api/orders/{order_id}`
3. Update the order status:
   - **Placed** → **Preparing**: When you start preparing the order
   - **Preparing** → **Ready**: When the order is ready
   - **Ready** → **Completed**: When the customer receives the order

#### Processing Payments
1. When a customer receives their order, update payment status
2. Use the endpoint: `PUT /api/orders/{order_id}/payment`
3. Set payment status to "Paid" for successful payments

### Inventory Management

#### Monitoring Stock Levels
1. Check low stock items: `GET /api/inventory/low-stock`
2. View current stock levels: `GET /api/inventory/stock-levels`
3. Items with low stock will be highlighted

#### Adding New Stock
1. Use the inventory transaction endpoint: `POST /api/inventory/transactions`
2. Create a "Stock_In" transaction with:
   - Item ID
   - Quantity received
   - Unit cost
   - Notes (optional)

#### Updating Stock Quantities
1. For bulk updates: `POST /api/inventory/bulk-update`
2. For single item: `PUT /api/inventory/items/{item_id}/stock`
3. Always include notes explaining the change

#### Recording Waste
1. When items are wasted or expired, create a "Waste" transaction
2. This helps track food waste and improve inventory management
3. Include details about why the item was wasted

### Menu Management

#### Adding New Items
1. Use the menu endpoint: `POST /api/menu`
2. Provide all required information:
   - Name, category, description
   - Price and initial stock quantity
   - Preparation time

#### Updating Existing Items
1. Use: `PUT /api/menu/{item_id}`
2. Update price, description, or availability
3. Change status to "Discontinued" to remove from menu

#### Managing Categories
1. View categories: `GET /api/menu/categories`
2. Categories help organize the menu
3. Contact administrator to add new categories

---

## Administrator Guide

### System Administration

#### User Management

##### Managing Customers
1. View all customers: `GET /api/customers`
2. Update customer information: `PUT /api/customers/{customer_id}`
3. Deactivate customers if needed

##### Managing Staff
1. Staff accounts are managed through the database
2. Roles include: Chef, Cashier, Manager, Admin
3. Set appropriate permissions for each role

#### System Monitoring

##### Dashboard Overview
1. Access dashboard data: `GET /api/analytics/dashboard`
2. Monitor key metrics:
   - Today's orders and revenue
   - Top selling items
   - Low stock alerts
   - Recent orders

##### Sales Analytics
1. **Sales Trends**: `GET /api/analytics/sales-trend`
   - View daily, weekly, or monthly trends
   - Analyze revenue patterns
2. **Category Analysis**: `GET /api/analytics/category-analysis`
   - See which categories perform best
   - Identify popular items
3. **Customer Analysis**: `GET /api/analytics/customer-analysis`
   - Understand customer behavior
   - Track customer loyalty

##### Inventory Analytics
1. **Stock Movement**: `GET /api/inventory/reports/stock-movement`
   - Track stock in/out patterns
   - Identify fast-moving items
2. **Waste Analysis**: `GET /api/inventory/reports/waste-analysis`
   - Monitor food waste
   - Identify items with high waste

### Reporting

#### Daily Sales Reports
1. Generate comprehensive daily reports: `GET /api/analytics/reports/daily-sales`
2. Reports include:
   - Sales summary
   - Top items for the day
   - Hourly breakdown
   - Payment method analysis

#### Inventory Reports
1. Generate inventory reports: `GET /api/analytics/reports/inventory-report`
2. Reports include:
   - Current stock levels
   - Stock movement summary
   - Low stock alerts

#### Staff Performance Reports
1. Monitor staff performance: `GET /api/analytics/staff-performance`
2. Track:
   - Orders processed
   - Revenue handled
   - Efficiency metrics

### System Configuration

#### Database Maintenance
1. Regular backups of the database
2. Monitor database performance
3. Optimize queries as needed

#### System Updates
1. Keep the system updated
2. Monitor for security updates
3. Test new features before deployment

---

## Troubleshooting

### Common Issues

#### Cannot Place Order
**Problem**: "Add to Cart" button is disabled
**Solution**: 
- Check if item is out of stock
- Refresh the page
- Clear browser cache

#### Order Not Showing
**Problem**: Order doesn't appear in "My Orders"
**Solution**:
- Wait a few minutes and refresh
- Check if you're logged in with the correct account
- Contact staff if issue persists

#### Payment Issues
**Problem**: Payment status not updating
**Solution**:
- Staff should update payment status manually
- Check order details for correct information
- Contact administrator if needed

#### Stock Issues
**Problem**: Items showing as available but out of stock
**Solution**:
- Staff should update inventory immediately
- Check for recent orders that may have depleted stock
- Update stock levels through inventory management

### Browser Issues

#### Page Not Loading
**Solutions**:
- Check internet connection
- Clear browser cache and cookies
- Try a different browser
- Disable browser extensions temporarily

#### Slow Performance
**Solutions**:
- Close unnecessary browser tabs
- Clear browser cache
- Check system resources
- Contact administrator if server is slow

### API Issues

#### Connection Errors
**Problem**: Cannot connect to backend API
**Solutions**:
- Check if backend server is running
- Verify API URL is correct
- Check firewall settings
- Contact system administrator

#### Authentication Errors
**Problem**: API returns authentication errors
**Solutions**:
- Check API credentials
- Verify user permissions
- Contact administrator for access

---

## FAQ

### General Questions

**Q: Do I need to create an account to place an order?**
A: Yes, you need to register when placing your first order. Your information is saved for future orders.

**Q: Can I modify my order after placing it?**
A: Once an order is placed, modifications depend on the order status. Contact staff for assistance.

**Q: What payment methods are accepted?**
A: The system supports Cash, Card, Digital Wallet, and UPI payments.

**Q: How long does it take to prepare my order?**
A: Preparation time varies by item and is displayed on each menu item. Typical times range from 5-30 minutes.

### Technical Questions

**Q: What browsers are supported?**
A: The system works with all modern browsers including Chrome, Firefox, Safari, and Edge.

**Q: Is my personal information secure?**
A: Yes, the system uses secure data handling practices and your information is protected.

**Q: Can I access the system from my mobile phone?**
A: Yes, the system is mobile-friendly and works on smartphones and tablets.

### Staff Questions

**Q: How do I update order status?**
A: Use the order management API endpoints to update order status as it progresses.

**Q: What should I do if an item is out of stock?**
A: Update the item status to "Out_of_Stock" and inform customers. Restock as soon as possible.

**Q: How often should I check inventory?**
A: Check low stock alerts daily and update inventory after receiving new stock.

### Administrator Questions

**Q: How do I add new menu items?**
A: Use the menu management API endpoints to add new items with all required information.

**Q: How can I monitor system performance?**
A: Use the analytics endpoints to monitor sales, inventory, and system performance.

**Q: What should I do if the system is slow?**
A: Check server resources, database performance, and consider optimizing queries or upgrading hardware.

### Support

For additional support or questions not covered in this guide:
1. Check the troubleshooting section
2. Review the API documentation
3. Contact your system administrator
4. Refer to the technical documentation

---

*This user guide is part of the Smart Canteen Ordering System project. For technical documentation, please refer to the README.md file.*















