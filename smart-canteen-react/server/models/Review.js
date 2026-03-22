// c:\Users\bhavya\Desktop\Projects\Web Develepment project edited\smart-canteen-react\server\models\Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  item_id: { type: Number, required: true }, // MenuItem.item_id
  customer_id: { type: Number, required: true },
  customer_name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  review_date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', reviewSchema);
