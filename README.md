# Bijarniya Furniture — Showroom Website & Admin Panel

Welcome to the complete full-stack web application for **Bijarniya Furniture** (Kuchaman City, Rajasthan).

This project includes:
- **Public Showroom Website**: Responsive website featuring furniture categories, product catalog with WhatsApp inquiry buttons, gallery lightbox, customer reviews (MongoDB), and showroom contact info.
- **Customer Review System**: Customers submit reviews via a form on the public website. Reviews are stored in MongoDB as `pending` until an admin approves them. Approved reviews appear publicly; mobile numbers are never exposed.
- **Secure Admin Panel**: Dashboard for managing products, categories, gallery photos, hero banners, customer reviews (approve/reject/reply/delete), and business settings without writing any code.
- **Node.js / Express Backend**: RESTful API for authentication, product catalog CRUD, category CRUD, gallery uploads, and website configuration.
- **MongoDB Database**: Persistent storage for products, categories, gallery photos, banners, business settings, and admin credentials.
- **Image Upload System**: Allows the showroom owner to upload product and gallery images directly from the Admin Panel.

---

## 🚀 Quick Start Guide (For Beginners)

### 1. Requirements
Make sure you have Node.js installed on your computer:
- **Node.js**: v18.x or higher
- **MongoDB**: MongoDB Atlas (Cloud database) OR local MongoDB instance

---

### 2. Installation

Open your terminal in the project directory and run:

```bash
npm install
```

This will automatically install all required backend packages (`express`, `mongoose`, `jsonwebtoken`, `bcryptjs`, `multer`, `dotenv`, `cors`, `helmet`).

---

### 3. MongoDB Database Setup

You can use **MongoDB Atlas** (Free Cloud Database) or a local MongoDB database:

#### Option A: MongoDB Atlas (Recommended & Free)
1. Create a free account at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free **M0 Cluster**.
3. Under **Database Access**, create a database user (e.g. username: `admin`, password: `yourpassword`).
4. Under **Network Access**, click **Add IP Address** and choose `0.0.0.0/0` (Allow Access from Anywhere).
5. Click **Connect** → **Drivers** and copy your connection string URL:
   `mongodb+srv://admin:<password>@cluster0.xxx.mongodb.net/bijarniya-furniture`

#### Option B: Local MongoDB
If MongoDB is installed locally on your Mac/PC:
`mongodb://127.0.0.1:27017/bijarniya-furniture`

---

### 4. Create Environment Settings File (`.env`)

In the project root folder, copy `.env.example` to create `.env`:

```bash
cp .env.example .env
```

Open `.env` and set your credentials:

```env
PORT=4000
MONGODB_URI=mongodb+srv://your_user:your_password@cluster0.xxx.mongodb.net/bijarniya-furniture
JWT_SECRET=your_long_random_secret_key
ADMIN_USERNAME=your_admin_username
ADMIN_EMAIL=your_email@example.com
ADMIN_PHONE=your_mobile_number
ADMIN_PASSWORD=your_secure_password
```

> Never share or commit this file.

---

### 5. Create Your First Admin Account

To create or update your Admin Panel login details, run:

```bash
npm run seed-admin
```

This will create or update the admin account using the credentials you set in your `.env` file.

Before running this command, add the following to your `.env`:

```env
ADMIN_USERNAME=your_admin_username
ADMIN_EMAIL=your_admin_email@example.com
ADMIN_PHONE=your_10_digit_mobile
ADMIN_PASSWORD=your_secure_password
```

> **Important**: Use a strong, unique password. The script will fail if any of these values are missing. Never commit real credentials to Git.

*(You can log in using any ONE of: Username, Email, OR Mobile Number + Password!)*

---

### 6. Migrate Initial Website Data to MongoDB

To populate MongoDB with the showroom's 24 products, 25 categories, and 15 gallery photos, run:

```bash
npm run seed-data
```

---

### 7. Start the Website & Backend Server

To start the server, run:

```bash
npm start
```

You will see:
```text
======================================================
🚀 Bijarniya Furniture server running on http://localhost:4000
🔑 Admin Panel available at: http://localhost:4000/admin
======================================================
```

---

## 🌐 URLs

- **Public Website**: [http://localhost:4000/](http://localhost:4000/)
- **Admin Panel**: [http://localhost:4000/admin](http://localhost:4000/admin)
- **Admin Login**: [http://localhost:4000/admin/login](http://localhost:4000/admin/login)

---

## 📁 File Structure Overview

```text
bijarniya-furniture/
├── index.html            → Public Showroom Website HTML
├── package.json          → Node.js project dependencies & scripts
├── README.md             → Beginner guide (this document)
├── .env.example          → Environment variables template
├── .gitignore            → Git settings
│
├── css/
│   ├── style.css         → Public site styling (preserved)
│   └── responsive.css    → Public site responsive layout
│
├── js/
│   ├── app.js            → Public website entry point
│   ├── config.js         → Dynamic website settings & API base URL
│   ├── data.js           → Catalogue data & static fallback
│   ├── gallery.js        → Gallery renderer & lightbox modal
│   ├── products.js       → Product catalog filters & search
│   ├── reviews.js        → Customer Reviews: loads approved reviews from MongoDB, submit form
│   └── ui.js             → Header scroll, mobile drawer, price list
│
├── admin/                → Admin Panel
│   ├── index.html        → Admin Dashboard (Products, Categories, Gallery, Banners, Reviews, Settings)
│   ├── login.html        → Admin Login page
│   ├── css/admin.css     → Admin Panel styles (matching brand colors #46291C)
│   └── js/               → Admin modules (auth, dashboard, products, categories, gallery, banners, reviews, settings)
│
├── server/               → Express Backend & MongoDB API
│   ├── server.js         → Main server file
│   ├── db.js             → MongoDB connection logic
│   ├── models/           → Mongoose schemas (Admin, Product, Category, Gallery, Banner, Settings)
│   ├── routes/           → REST API endpoints (/api/products, /api/auth, /api/upload, etc.)
│   ├── middleware/       → Authentication & Multer image upload handlers
│   └── scripts/          → Setup scripts (seedAdmin.js, seedData.js)
│
├── uploads/              → Uploaded product photos & gallery images
└── images/               → Existing public website static images
```

---

## 🔐 Security Features

- **Password Hashing**: Admin passwords stored securely using `bcryptjs` with salt rounds.
- **Authentication**: JWT (JSON Web Tokens) with expiration.
- **Route Protection**: All administrative API endpoints (`POST`, `PUT`, `DELETE`, `/api/upload`) require a valid Bearer token.
- **Rate Limiting**: Brute-force protection on `/api/auth/login` (max 15 attempts per 15 mins).
- **Security Headers**: Enabled via `helmet` middleware.
- **Environment Isolation**: Database secrets and JWT keys stored safely in `.env`.

---

## ☁️ Deployment Guide (Render.com)

This project is fully prepared for a production deployment on [Render.com](https://render.com/) as a monolithic Node.js application (serving both the public HTML and the API from the exact same domain). No changes to the codebase are required.

### 1. Render Configuration
- Create a new **Web Service** on Render and connect your GitHub repository.
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 2. Environment Variables
In the Render Web Service dashboard, go to the **Environment** tab and add the following keys exactly as they appear in your `.env` file:
- `MONGODB_URI`: Your MongoDB Atlas connection string (e.g., `mongodb+srv://...`)
- `JWT_SECRET`: A secure, random string used for Admin authentication.

*(Render automatically injects the `PORT` variable, so you do not need to add it. The Express app already listens on `process.env.PORT`).*

### 3. Image Uploads (Persistent Disk)
Because this project uploads images to a local `/uploads` folder, you must add a Persistent Disk in Render so your uploaded images are not deleted when Render restarts the server:
1. In the Render Dashboard for your service, go to **Disks**.
2. Click **Add Disk**.
3. Name it (e.g., `uploads-disk`), and set Size (e.g., `1 GB`).
4. Set the **Mount Path** exactly to: `/opt/render/project/src/uploads`

### 4. MongoDB Atlas Whitelist
Don't forget to go to your MongoDB Atlas dashboard -> **Network Access** and add `0.0.0.0/0` (Allow Access from Anywhere), because Render's IP addresses are dynamic and change automatically.
