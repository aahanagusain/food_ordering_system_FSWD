const mongoose = require('mongoose');
const MONGO_URI = 'mongodb://localhost:27017/smart_canteen';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('🔗 Connected to MongoDB');
    
    const Customer = mongoose.model('Customer', new mongoose.Schema({
        customer_id: Number,
        name: String,
        email: String,
        phone: String,
        customer_type: String,
        password: String
    }));

    await Customer.deleteMany({ email: { $in: ['bhavya@gmail.com', 'bhavya1@gmail.com', 'bhavya3@gmail.com'] } });
    
    const customers = [
        { customer_id: 101, name: 'Bhavya', email: 'bhavya@gmail.com', phone: '1234567890', customer_type: 'Student', password: '1234' },
        { customer_id: 102, name: 'Bhavya1', email: 'bhavya1@gmail.com', phone: '1234567891', customer_type: 'Student', password: '1234' }
    ];

    await Customer.insertMany(customers);
    console.log('✅ Bhavya accounts seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

seed();
