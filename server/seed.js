import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Product from './models/Product.js';
import DeliveryPartner from './models/DeliveryPartner.js';
import Address from './models/Address.js';
import Order from './models/Order.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/crossmart';

const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('Database connected.');

    // Clear existing data
    console.log('Clearing old collections...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await DeliveryPartner.deleteMany({});
    await Address.deleteMany({});
    await Order.deleteMany({});
    console.log('Collections cleared.');

    // Password hash
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create Users
    console.log('Creating users...');
    const user = new User({
      name: 'Rahul Sharma',
      email: 'user@example.com',
      password: hashedPassword,
      role: 'user'
    });
    await user.save();

    const admin = new User({
      name: 'CrossMart Admin',
      email: 'admin@crossmart.com',
      password: hashedPassword,
      role: 'admin'
    });
    await admin.save();
    console.log('Users created.');

    // Create Delivery Partners
    console.log('Creating delivery partners...');
    const partner1 = new DeliveryPartner({
      name: 'Rajesh Kumar',
      email: 'partner1@crossmart.com',
      password: hashedPassword,
      phone: '+91 98765 12345',
      vehicleType: 'bike',
      isActive: true
    });
    await partner1.save();

    const partner2 = new DeliveryPartner({
      name: 'Amit Patel',
      email: 'partner2@crossmart.com',
      password: hashedPassword,
      phone: '+91 98765 67890',
      vehicleType: 'scooter',
      isActive: true
    });
    await partner2.save();

    const partner3 = new DeliveryPartner({
      name: 'Suresh Pillai',
      email: 'partner3@crossmart.com',
      password: hashedPassword,
      phone: '+91 91234 56789',
      vehicleType: 'car',
      isActive: false
    });
    await partner3.save();
    console.log('Delivery partners created.');

    // Seed default addresses
    console.log('Creating address...');
    const address1 = new Address({
      user: user._id,
      fullName: 'Rahul Sharma',
      phone: '+91 98765 43210',
      street: '123, MG Road, Apt 4B',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      isDefault: true
    });
    await address1.save();

    const address2 = new Address({
      user: user._id,
      fullName: 'Rahul Sharma',
      phone: '+91 98765 43210',
      street: '456 Oak Street',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001',
      isDefault: false
    });
    await address2.save();
    console.log('Addresses created.');

    // Create Products
    console.log('Creating products...');
    const productsData = [
      {
        name: 'Organic Fresh Bananas',
        description: 'Rich in potassium and vitamins, fresh from organic farms.',
        price: 60,
        originalPrice: 70,
        image: '/src/assets/products/products- 01.png',
        category: 'fruits-vegetables',
        unit: 'doz',
        rating: 4.8,
        reviewsCount: 96,
        stock: 120,
        isOrganic: true,
        badge: 'Sale'
      },
      {
        name: 'Sweet Red Strawberries',
        description: 'Juicy, sweet, and freshly plucked red strawberries.',
        price: 120,
        originalPrice: 150,
        image: '/src/assets/products/products- 02.png',
        category: 'fruits-vegetables',
        unit: 'box',
        rating: 4.9,
        reviewsCount: 148,
        stock: 85,
        isOrganic: true,
        badge: 'Hot'
      },
      {
        name: 'Pure Wildflower Honey',
        description: '100% natural, unfiltered wildflower honey.',
        price: 280,
        originalPrice: 320,
        image: '/src/assets/products/products- 03.png',
        category: 'pantry',
        unit: 'jar',
        rating: 4.9,
        reviewsCount: 215,
        stock: 50,
        isOrganic: true,
        badge: 'Popular'
      },
      {
        name: 'Artisan Sourdough Bread',
        description: 'Traditional slow-fermented crusty sourdough loaf.',
        price: 90,
        originalPrice: 100,
        image: '/src/assets/products/products-04.png',
        category: 'bakery',
        unit: 'loaf',
        rating: 4.7,
        reviewsCount: 84,
        stock: 40,
        isOrganic: false
      },
      {
        name: 'Fresh Farm Whole Milk',
        description: 'Pasteurized farm fresh creamy whole milk.',
        price: 75,
        originalPrice: 85,
        image: '/src/assets/products/products-05.png',
        category: 'dairy-eggs',
        unit: 'L',
        rating: 4.8,
        reviewsCount: 310,
        stock: 150,
        isOrganic: false
      },
      {
        name: 'Organic Free-Range Eggs',
        description: 'Grade-A healthy farm eggs from free-range chickens.',
        price: 110,
        originalPrice: 130,
        image: '/src/assets/products/products-06.png',
        category: 'dairy-eggs',
        unit: 'pack',
        rating: 4.9,
        reviewsCount: 175,
        stock: 90,
        isOrganic: true,
        badge: '15% OFF'
      },
      {
        name: 'Fresh Hass Avocados',
        description: 'Creamy Hass avocados rich in healthy fats.',
        price: 160,
        originalPrice: 180,
        image: '/src/assets/products/products-07.png',
        category: 'fruits-vegetables',
        unit: 'kg',
        rating: 4.6,
        reviewsCount: 52,
        stock: 65,
        isOrganic: false
      },
      {
        name: 'Organic Rolled Oats',
        description: '100% whole grain organic rolled oats for healthy breakfast.',
        price: 140,
        originalPrice: 160,
        image: '/src/assets/products/products-08.png',
        category: 'pantry',
        unit: 'pack',
        rating: 4.7,
        reviewsCount: 93,
        stock: 110,
        isOrganic: true
      },
      {
        name: 'Cherry Tomatoes',
        description: 'Sweet and juicy organic cherry tomatoes.',
        price: 85,
        originalPrice: 95,
        image: '/src/assets/products/products- 01.png',
        category: 'fruits-vegetables',
        unit: 'kg',
        rating: 4.5,
        reviewsCount: 67,
        stock: 75,
        isOrganic: false
      },
      {
        name: 'Greek Yogurt',
        description: 'Thick and rich plain Greek yogurt.',
        price: 95,
        originalPrice: 110,
        image: '/src/assets/products/products-05.png',
        category: 'dairy-eggs',
        unit: 'tub',
        rating: 4.8,
        reviewsCount: 120,
        stock: 80,
        isOrganic: false,
        badge: 'New'
      },
      {
        name: 'Multigrain Crackers',
        description: 'Crispy whole grain healthy snacking crackers.',
        price: 65,
        originalPrice: 75,
        image: '/src/assets/products/products-04.png',
        category: 'bakery',
        unit: 'pack',
        rating: 4.4,
        reviewsCount: 39,
        stock: 100,
        isOrganic: false
      },
      {
        name: 'Cold-Pressed Olive Oil',
        description: 'Extra virgin cold-pressed olive oil for cooking and dressing.',
        price: 350,
        originalPrice: 400,
        image: '/src/assets/products/products- 03.png',
        category: 'pantry',
        unit: '500ml',
        rating: 4.9,
        reviewsCount: 188,
        stock: 45,
        isOrganic: true,
        badge: 'Popular'
      },
      {
        name: 'Organic Spinach',
        description: 'Fresh crisp organic spinach leaves.',
        price: 45,
        originalPrice: 55,
        image: '/src/assets/products/products- 02.png',
        category: 'fruits-vegetables',
        unit: 'bunch',
        rating: 4.6,
        reviewsCount: 55,
        stock: 60,
        isOrganic: true
      },
      {
        name: 'Cheddar Cheese Block',
        description: 'Sharp aged cheddar cheese block.',
        price: 180,
        originalPrice: 210,
        image: '/src/assets/products/products-06.png',
        category: 'dairy-eggs',
        unit: '200g',
        rating: 4.7,
        reviewsCount: 74,
        stock: 55,
        isOrganic: false,
        badge: 'Sale'
      },
      {
        name: 'Whole Wheat Pasta',
        description: 'High-fiber whole wheat penne pasta.',
        price: 75,
        originalPrice: 85,
        image: '/src/assets/products/products-08.png',
        category: 'pantry',
        unit: '500g',
        rating: 4.5,
        reviewsCount: 62,
        stock: 120,
        isOrganic: false
      },
      {
        name: 'Croissants (4-pack)',
        description: 'Buttery, flaky fresh-baked French croissants.',
        price: 120,
        originalPrice: 140,
        image: '/src/assets/products/products-04.png',
        category: 'bakery',
        unit: 'pack',
        rating: 4.8,
        reviewsCount: 101,
        stock: 35,
        isOrganic: false,
        badge: 'Hot'
      }
    ];

    await Product.insertMany(productsData);
    console.log('Products inserted.');

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
