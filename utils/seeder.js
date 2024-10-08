const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Product = require('../models/product');

dotenv.config();

const users = [
    {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'adminpassword',
        role: 'admin'
    },
    {
        name: 'Customer User',
        email: 'customer@example.com',
        password: 'customerpassword',
        role: 'customer'
    }
];

const products = [
    {
        name: 'Product 1',
        description: 'Description for product 1',
        price: 100,
        stock: 50,
        category: 'Category 1'
    },
    {
        name: 'Product 2',
        description: 'Description for product 2',
        price: 200,
        stock: 30,
        category: 'Category 2'
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        await User.deleteMany({});
        await Product.deleteMany({});

       
        const hashedUsers = await Promise.all(users.map(async user => {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
            return user;
        }));

        const createdUsers = await User.insertMany(hashedUsers);
        console.log('Users added:', createdUsers);

        const createdProducts = await Product.insertMany(products);
        console.log('Products added:', createdProducts);

        console.log('Database seeded successfully');
        mongoose.connection.close();
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

seedDB();