// models/MenuItem.js - Menu Item Schema for MongoDB
const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  item_id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  category_name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: 'Delicious food item'
  },
  price: {
    type: Number,
    required: true
  },
  stock_quantity: {
    type: Number,
    default: 0
  },
  preparation_time: {
    type: Number,
    default: 5
  },
  status: {
    type: String,
    default: 'Available'
  }
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
