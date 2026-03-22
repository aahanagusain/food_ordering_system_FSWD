// models/Order.js - Order Schema for MongoDB
const mongoose = require('mongoose');

const orderDetailSchema = new mongoose.Schema({
  item_id: { type: Number, required: true },
  name: { type: String },
  quantity: { type: Number, required: true, default: 1 },
  unit_price: { type: Number, required: true },
  line_total: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  order_id: {
    type: Number,
    required: true,
    unique: true
  },
  customer_id: {
    type: Number,
    required: true
  },
  items: {
    type: String   // comma-separated summary string
  },
  line_items: [orderDetailSchema],
  subtotal: { type: Number, default: 0 },
  tax_percent: { type: Number, default: 5 },
  tax_amount: { type: Number, default: 0 },
  total_amount: {
    type: Number,
    required: true
  },
  payment_status: {
    type: String,
    default: 'Paid'
  },
  order_status: {
    type: String,
    default: 'Placed'
  },
  payment_method: {
    type: String,
    default: 'Cash'
  },
  item_count: { type: Number, default: 0 },
  coupon_code: { type: String, default: '' },
  coupon_discount: { type: Number, default: 0 },
  order_date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
