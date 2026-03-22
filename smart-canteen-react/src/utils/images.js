// src/utils/images.js - Image mapping for dish names
// Maps each dish name to its local image file

const imageMap = {
  'Masala Chai': '/Images/Masala Chai.jpg',
  'Coffee': '/Images/Coffee.avif',
  'Cold Coffee': '/Images/Cold Coffee.jpg',
  'Orange Juice': '/Images/Orange Juice.jpg',
  'Samosa': '/Images/Samosa.jpg',
  'Vada Pav': '/Images/Vada pav.jpg',
  'Poha': '/Images/Poha.jpg',
  'Sandwich': '/Images/Sandwich.avif',
  'Dal Rice': '/Images/Dal Rice.jpg',
  'Rajma Rice': '/Images/Rajma Rice.jpg',
  'Chole Bhature': '/Images/Chole Bhature.jpg',
  'Biryani': '/Images/Biryani.jpg',
  'Gulab Jamun': '/Images/Gulab Jamun.jpg',
  'Ice Cream': '/Images/Ice cream.jpg',
  'Kheer': '/Images/Kheer.jpg',
  'Idli Sambar': '/Images/Idli Sambhar.jpg',
  'Dosa': '/Images/Masala Dosa.jpg',
  'Paratha': '/Images/Parantha.webp'
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';

export function getDishImage(name) {
  return imageMap[name] || DEFAULT_IMAGE;
}
