const mongoose = require('mongoose');
const MONGO_URI = 'mongodb://localhost:27017/smart_canteen';

async function clear() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('🔗 Connected to MongoDB');
    const result = await mongoose.connection.collection('customers').deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} customers`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

clear();
