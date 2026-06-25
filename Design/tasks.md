# Maleesha Stores - Project Roadmap & Tasks

## 🛠️ Phase 1: Project Architecture & Environment Setup
- [ ] 1.1. Directory Structure Setup (Frontend/Backend)
- [ ] 1.2. Backend: Express, Mongoose, Dotenv, Cors
- [ ] 1.3. Frontend: Vite, Tailwind CSS, Axios
- [ ] 1.4. Environment Variable Configuration

## 🗄️ Phase 2: Dynamic Database Models & Backend API
- [ ] 2.1. MongoDB Connection Setup
- [ ] 2.2. **Category Model**: Create `models/Category.js` (Fields: `name`, `icon/image_url`, `slug`).
- [ ] 2.3. **Product Model**: Update `models/Product.js` to reference Category (Fields: `name`, `price`, `unit`, `category_id` (ref to Category), `stock`, `image_url`).
- [ ] 2.4. Product & Category API Endpoints:
    - GET/POST/PUT/DELETE for `/api/categories`
    - GET/POST/PUT/DELETE for `/api/products` (filter by category_id)

## 🎨 Phase 3: Frontend Setup & Core Layout
- [ ] 3.1. Tailwind Theme (Emerald Green/Warm Amber)
- [ ] 3.2. Responsive Navbar & Search
- [ ] 3.3. Footer & Info Section

## 🍎 Phase 4: Dynamic Category & Product Catalog
- [ ] 4.1. **Dynamic Category Bar**: Fetch categories from `/api/categories` and render as clickable icons, similar to the layout in **image_08ab41.png**.
- [ ] 4.2. **Dynamic Product Grid**: Filter products automatically based on the selected category.
- [ ] 4.3. Product Card Component with Quick-Add functionality.

## 🛒 Phase 5: Cart Management & Checkout Flow
- [ ] 5.1. CartContext API for global state.
- [ ] 5.2. Persistent Cart (localStorage).
- [ ] 5.3. Drawer/Slide-out Cart Panel.
- [ ] 5.4. Checkout Form (Pickup vs. Delivery, Phone, Address).

## 🔑 Phase 6: Admin Dashboard (Dynamic Management)
- [ ] 6.1. Admin Auth (Passcode protected).
- [ ] 6.2. **Category Management View**: Form to add/edit/delete sections. Users upload an icon and name the section (e.g., "Dairy", "Baby Food").
- [ ] 6.3. **Inventory Management View**: Table to add products, assign them to a specific dynamic category created in 6.2, and manage stock levels.
- [ ] 6.4. Orders Management Board.

## 🚀 Phase 7: Testing, Polish, & Deployment
- [ ] 7.1. Usability & Touch-target audit.
- [ ] 7.2. Production build and MongoDB Atlas hosting.
