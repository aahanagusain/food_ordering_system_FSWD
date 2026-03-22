const mongoose = require('mongoose');
const MONGO_URI = 'mongodb://localhost:27017/smart_canteen';

async function checkIndexes() {
  try {
    await mongoose.connect(MONGO_URI);
    const Customer = require('./models/Customer');
    const indexes = await Customer.collection.indexes();
    console.log('Indexes for customers collection:', indexes);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkIndexes();
