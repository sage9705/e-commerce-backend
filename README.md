# E-commerce Backend

This project is a modular, feature-rich e-commerce backend built using Node.js, Express.js, and MongoDB Atlas. It includes user authentication, product management, order processing, and initial database population.

## Table of Contents

- [E-commerce Backend](#e-commerce-backend)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Installation](#installation)
  - [Usage](#usage)
  - [API Endpoints](#api-endpoints)
    - [User Routes](#user-routes)
    - [Product Routes](#product-routes)
    - [Order Routes](#order-routes)
  - [Environment Variables](#environment-variables)

## Features

- User authentication (registration, login)
- Role-based authorization (admin, customer)
- Product management (CRUD operations)
- Order processing (create, view orders)
- Initial database population with default users and products


## Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/sage9705/e-commerce-backend.git
    cd e-commerce-backend
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Set up environment variables:**

    Create a `.env` file in the root directory and add your configuration:

    ```plaintext
    MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/ecommerce?retryWrites=true&w=majority
    JWT_SECRET=your_jwt_secret
    EMAIL_USER=your_email@example.com
    EMAIL_PASS=your_email_password

    ADMIN_NAME=Admin User
    ADMIN_EMAIL=admin@example.com
    ADMIN_PASSWORD=password123

    CUSTOMER_NAME=Customer User
    CUSTOMER_EMAIL=customer@example.com
    CUSTOMER_PASSWORD=password123

    PORT=3356 # Optional, defaults to 5000 if not provided
    ```

4. **Run the seed script to populate the database with initial data:**

    ```bash
    node utils/seeder.js
    ```

5. **Start the server:**

    ```bash
    npm start
    ```

## Usage

The server will start on the port specified in your environment variables (default is 5000). You can use tools like Postman or Insomnia to interact with the API endpoints.

## API Endpoints

### User Routes

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login a user
- `GET /api/users/profile` - Get the profile of the logged-in user (requires token)

### Product Routes

- `POST /api/products` - Create a new product (admin only)
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a product by ID
- `PUT /api/products/:id` - Update a product by ID (admin only)
- `DELETE /api/products/:id` - Delete a product by ID (admin only)

### Order Routes

- `POST /api/orders` - Create a new order (requires token)
- `GET /api/orders` - Get all orders for the logged-in user (requires token)
- `GET /api/orders/:id` - Get an order by ID (requires token)

## Environment Variables

The following environment variables are required:

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT authentication
- `EMAIL_USER` - Email address for sending notifications
- `EMAIL_PASS` - Password for the email address

Additionally, to seed the initial data, the following are required:

- `ADMIN_NAME` - Name of the admin user
- `ADMIN_EMAIL` - Email of the admin user
- `ADMIN_PASSWORD` - Password for the admin user
- `CUSTOMER_NAME` - Name of the customer user
- `CUSTOMER_EMAIL` - Email of the customer user
- `CUSTOMER_PASSWORD` - Password for the customer user
