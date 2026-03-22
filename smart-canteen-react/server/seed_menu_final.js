const mongoose = require('mongoose');
const MONGO_URI = 'mongodb://localhost:27017/smart_canteen';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('🔗 Connected to MongoDB');
    
    const MenuItem = mongoose.model('MenuItem', new mongoose.Schema({
        item_id: Number,
        name: String,
        category_name: String,
        price: Number,
        stock_quantity: Number,
        description: String,
        rating: Number,
        reviews_count: Number
    }));

    await MenuItem.deleteMany({});
    
    const seedData = [
            { item_id: 1, name: 'Masala Chai', category_name: 'Beverages', price: 15.00, stock_quantity: 100, description: 'Traditional Indian spiced tea', rating: 4.8, reviews_count: 150 },
            { item_id: 2, name: 'Coffee', category_name: 'Beverages', price: 20.00, stock_quantity: 80, description: 'Hot brewed coffee', rating: 4.2, reviews_count: 85 },
            { item_id: 3, name: 'Cold Coffee', category_name: 'Beverages', price: 35.00, stock_quantity: 50, description: 'Iced coffee with cream', rating: 4.9, reviews_count: 210 },
            { item_id: 4, name: 'Orange Juice', category_name: 'Beverages', price: 25.00, stock_quantity: 30, description: 'Fresh squeezed orange juice', rating: 4.5, reviews_count: 45 },
            { item_id: 5, name: 'Samosa', category_name: 'Snacks', price: 12.00, stock_quantity: 200, description: 'Crispy fried pastry with spiced filling', rating: 4.7, reviews_count: 320 },
            { item_id: 6, name: 'Vada Pav', category_name: 'Snacks', price: 25.00, stock_quantity: 150, description: 'Mumbai style potato fritter burger', rating: 4.6, reviews_count: 180 },
            { item_id: 7, name: 'Poha', category_name: 'Snacks', price: 20.00, stock_quantity: 100, description: 'Flattened rice with spices', rating: 4.3, reviews_count: 90 },
            { item_id: 8, name: 'Sandwich', category_name: 'Snacks', price: 30.00, stock_quantity: 80, description: 'Fresh grilled vegetable sandwich', rating: 4.4, reviews_count: 110 },
            { item_id: 9, name: 'Dal Rice', category_name: 'Main Course', price: 45.00, stock_quantity: 60, description: 'Comforting lentil curry with steamed rice', rating: 4.5, reviews_count: 75 },
            { item_id: 10, name: 'Rajma Rice', category_name: 'Main Course', price: 50.00, stock_quantity: 50, description: 'Kidney bean curry with rice', rating: 4.7, reviews_count: 130 },
            { item_id: 11, name: 'Chole Bhature', category_name: 'Main Course', price: 60.00, stock_quantity: 40, description: 'Spiced chickpeas with fried bread', rating: 4.8, reviews_count: 250 },
            { item_id: 12, name: 'Biryani', category_name: 'Main Course', price: 70.00, stock_quantity: 35, description: 'Fragrant spiced rice dish', rating: 4.9, reviews_count: 420 },
            { item_id: 13, name: 'Gulab Jamun', category_name: 'Desserts', price: 25.00, stock_quantity: 100, description: 'Sweet milk-solid balls in syrup', rating: 4.8, reviews_count: 190 },
            { item_id: 14, name: 'Ice Cream', category_name: 'Desserts', price: 30.00, stock_quantity: 50, description: 'Creamy vanilla ice cream', rating: 4.5, reviews_count: 65 },
            { item_id: 15, name: 'Kheer', category_name: 'Desserts', price: 35.00, stock_quantity: 40, description: 'Rice pudding with nuts', rating: 4.6, reviews_count: 40 },
            { item_id: 16, name: 'Idli Sambar', category_name: 'Breakfast', price: 30.00, stock_quantity: 80, description: 'Steamed rice cakes with lentil soup', rating: 4.6, reviews_count: 120 },
            { item_id: 17, name: 'Dosa', category_name: 'Breakfast', price: 40.00, stock_quantity: 60, description: 'Crispy fermented rice crepe', rating: 4.8, reviews_count: 310 },
            { item_id: 18, name: 'Paratha', category_name: 'Breakfast', price: 35.00, stock_quantity: 70, description: 'Stuffed Indian flatbread', rating: 4.5, reviews_count: 140 }
        ];

    await MenuItem.insertMany(seedData);
    console.log('✅ Menu seeded with customized ratings');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

seed();
