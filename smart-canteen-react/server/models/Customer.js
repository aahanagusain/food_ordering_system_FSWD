// models/Customer.js - Customer Schema for MongoDB
const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  customer_id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    default: ''
  },
  customer_type: {
    type: String,
    enum: ['Student', 'Staff', 'Guest'],
    default: 'Guest'
  }
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
