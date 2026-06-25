const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Load env vars
dotenv.config();

const categoriesData = [
  { name: 'Fresh Fruits', slug: 'fresh-fruits', icon_url: 'Apple' },
  { name: 'Vegetables', slug: 'vegetables', icon_url: 'Leaf' },
  { name: 'Dairy & Eggs', slug: 'dairy-eggs', icon_url: 'Egg' },
  { name: 'Bakery', slug: 'bakery', icon_url: 'Croissant' },
  { name: 'Beverages', slug: 'beverages', icon_url: 'Coffee' },
  { name: 'Pantry Staples', slug: 'pantry-staples', icon_url: 'Package' }
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/maleesha-stores';
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected for seeding...');

    // Clear existing data
    await Category.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();
    console.log('Cleared existing collections.');

    // Insert categories
    const createdCategories = await Category.insertMany(categoriesData);
    console.log(`Seeded ${createdCategories.length} categories.`);

    // Find category ids
    const getCatId = (slug) => createdCategories.find(c => c.slug === slug)._id;

    // Products data
    const productsData = [
      {
        name: 'Red Apple (Imported)',
        price: 450,
        unit: 'kg',
        category_id: getCatId('fresh-fruits'),
        stock: 50,
        image_url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=60'
      },
      {
        name: 'Fresh Banana (Cavendish)',
        price: 280,
        unit: 'kg',
        category_id: getCatId('fresh-fruits'),
        stock: 80,
        image_url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=60'
      },
      {
        name: 'Ripe Mango (Karthacolomban)',
        price: 350,
        unit: 'kg',
        category_id: getCatId('fresh-fruits'),
        stock: 35,
        image_url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=60'
      },
      {
        name: 'Fresh Carrots',
        price: 240,
        unit: 'kg',
        category_id: getCatId('vegetables'),
        stock: 60,
        image_url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&auto=format&fit=crop&q=60'
      },
      {
        name: 'Red Onions',
        price: 320,
        unit: 'kg',
        category_id: getCatId('vegetables'),
        stock: 120,
        image_url: 'https://images.unsplash.com/photo-1508747703725-719ae2c73ee8?w=600&auto=format&fit=crop&q=60'
      },
      {
        name: 'Fresh Tomatoes',
        price: 180,
        unit: 'kg',
        category_id: getCatId('vegetables'),
        stock: 75,
        image_url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=60'
      },
      {
        name: 'Fresh Milk 1L',
        price: 490,
        unit: 'pack',
        category_id: getCatId('dairy-eggs'),
        stock: 40,
        image_url: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&auto=format&fit=crop&q=60'
      },
      {
        name: 'Large Brown Eggs (10 Pack)',
        price: 420,
        unit: 'pack',
        category_id: getCatId('dairy-eggs'),
        stock: 45,
        image_url: 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=600&auto=format&fit=crop&q=60'
      },
      {
        name: 'Cheddar Cheese 200g',
        price: 850,
        unit: 'pack',
        category_id: getCatId('dairy-eggs'),
        stock: 25,
        image_url: 'https://images.unsplash.com/photo-1618164435735-413d3b066c9a?w=600&auto=format&fit=crop&q=60'
      },
      {
        name: 'White Sandwich Bread',
        price: 170,
        unit: 'pack',
        category_id: getCatId('bakery'),
        stock: 30,
        image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=60'
      },
      {
        name: 'Chocolate Chip Cookies',
        price: 350,
        unit: 'pack',
        category_id: getCatId('bakery'),
        stock: 50,
        image_url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&auto=format&fit=crop&q=60'
      },
      {
        name: 'Keeri Samba Rice 5kg',
        price: 1650,
        unit: 'pack',
        category_id: getCatId('pantry-staples'),
        stock: 40,
        image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=60'
      },
      {
        name: 'Premium Tea Leaves 250g',
        price: 480,
        unit: 'pack',
        category_id: getCatId('beverages'),
        stock: 65,
        image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=60'
      }
    ];

    const seededProducts = await Product.insertMany(productsData);
    console.log(`Seeded ${seededProducts.length} products.`);

    console.log('Database seeding completed successfully!');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error seeding database:', err);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedDB();
