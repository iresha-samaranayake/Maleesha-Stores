# Maleesha Stores - Local Grocery Management Web App

A modern, mobile-first, full-stack web application designed for a family-owned grocery store to manage inventory, display product catalogs, handle category filtering, cart systems, checkout, and order fulfillment.

---

## 🚀 Technology Stack

- **Frontend**: React (Vite) + Tailwind CSS + Axios + Lucide Icons
- **Backend**: Node.js + Express.js + Mongoose
- **Database**: MongoDB (Atlas or Local Server)

---

## 🛠️ Project Structure

```text
Maleesha Stores/
├── backend/
│   ├── config/
│   │   └── db.js            # Mongoose database connection
│   ├── models/
│   │   ├── Category.js      # Dynamic grocery sections
│   │   ├── Product.js       # Grocery product items
│   │   └── Order.js         # Customer checkout orders
│   ├── routes/
│   │   ├── categoryRoutes.js# REST endpoints for categories
│   │   ├── productRoutes.js # REST endpoints for products (with search/filters)
│   │   └── orderRoutes.js   # REST endpoints for order placements/status
│   ├── scripts/
│   │   └── seed.js          # DB seeder script with mock groceries
│   ├── .env                 # Backend environment configs (port, database URI)
│   ├── package.json
│   └── server.js            # Main Express entry point
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminDashboard.jsx # Security passcode gate, catalog/orders manager
│   │   │   ├── CartDrawer.jsx     # Slide-out cart with subtotal summaries
│   │   │   ├── CategoryBar.jsx    # Dynamic horizontal category selection
│   │   │   ├── CheckoutForm.jsx   # Client order details, pickup vs delivery inputs
│   │   │   ├── Footer.jsx         # Contact, map, operating hours
│   │   │   ├── Navbar.jsx         # Interactive search, dynamic cart count
│   │   │   └── ProductCard.jsx    # Stock status indicator, quantity controls
│   │   ├── context/
│   │   │   └── CartContext.jsx    # Global cart state synced to localStorage
│   │   ├── App.css
│   │   ├── App.jsx                # Main layout dispatcher
│   │   ├── index.css              # Custom scrollbars, Tailwind imports, typography
│   │   └── main.jsx
│   ├── .env                       # Frontend environment config (backend API URL)
│   ├── tailwind.config.js
│   └── package.json
└── Design/
    └── tasks.md                   # Development roadmap tasklist
```

---

## 📦 Setting Up the Project

### 1. Prerequsite Installation
Ensure you have [Node.js](https://nodejs.org/) installed.

### 2. Configure Environment Variables
Since MongoDB is not running locally, update the backend database connection to point to your **MongoDB Atlas** cloud cluster.

1. Open the backend configuration file at [backend/.env](file:///d:/Maleesha%20Stores/backend/.env).
2. Replace the connection string with your MongoDB Atlas URI:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/maleesha-stores?retryWrites=true&w=majority
   ```
3. Open the frontend configuration file at [frontend/.env](file:///d:/Maleesha%20Stores/frontend/.env) and verify:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

### 3. Install Dependencies
Run dependency installations for both components.

* For **Backend**:
  Inside your terminal:
  ```bash
  cd backend
  npm install
  ```

* For **Frontend**:
  Inside your terminal:
  ```bash
  cd frontend
  npm install
  ```

### 4. Seed the Database
Run the seeding script to populate your MongoDB Atlas database with default grocery categories (Fruits, Vegetables, Dairy, Bakery, etc.) and a dozen products.

Inside your terminal under the `backend` folder:
```bash
node scripts/seed.js
```

---

## 🏃 Running the Application

To run the application locally, start both the backend server and frontend development server.

1. **Start Backend API Server**:
   Under `backend/` directory:
   ```bash
   npm run dev
   ```
   The API will run on `http://localhost:5000`.

2. **Start Frontend Client Server**:
   Under `frontend/` directory:
   ```bash
   npm run dev
   ```
   The application will boot up at `http://localhost:5173`. Open this URL in your web browser.

---

## 🔐 Store Administration & Management

- Click **Admin Panel** on the right side of the Navbar header.
- Enter the default manager passcode: `1234`.
- Under the Admin Panel, you can:
  - **Orders**: View client names, phone numbers, fulfillment selections (pickup vs. delivery), items bought, total price, and update the status dropdown.
  - **Inventory**: Check current stock metrics (e.g. low stock alerts), add new items (name, price, unit, image link, stock), edit existing parameters, or remove products.
  - **Categories**: Create dynamic categories by choosing an icon (e.g., Apple, Carrot, Coffee) and naming the section. Added sections dynamically load as selectable icons in the customer interface.
