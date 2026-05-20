# MrMobi Store — Full-Stack E-Commerce Platform

A full-stack e-commerce app built with **Spring Boot** + **React + Vite**. Includes storefront, cart, checkout, order tracking, wishlist, product reviews, and a full admin dashboard.

---

## Screenshots

### 🏠 Home Page
![Home Page](screenshots/home.png)

### 📦 Product Listing
![Product Listing](screenshots/products.png)

### 🛒 Cart & Checkout
![Cart and Checkout](screenshots/checkout.png)

### 🛠️ Admin Dashboard
![Admin Dashboard](screenshots/admin.png)

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Backend** | Java 21, Spring Boot 4, Spring Security, Spring Data JPA, MySQL, Lombok, Maven |
| **Frontend** | React 19, Vite, Redux Toolkit, React Router v7, Tailwind CSS, Axios, Framer Motion |

---

## Features

**User Side**
- Register / Login with JWT auth
- Browse & search products by category
- Add to cart, wishlist, product reviews
- Checkout with saved address management
- Order history & tracking

**Admin Side**
- Analytics dashboard with charts
- Product, Category, Banner management
- Order & Shipping management
- User management & review moderation
- Out-of-stock tracking

---

## Project Structure

```
mrmobi-store_ecommerce_full-stack/
├── backend/          # Spring Boot REST API
│   └── src/main/java/com/mrmobi/ecommerce/
│       ├── controller/
│       ├── entity/
│       ├── service/
│       ├── repository/
│       └── security/
└── client/           # React + Vite Frontend
    └── src/
        ├── pages/user/
        ├── pages/admin/
        ├── components/
        ├── redux/
        └── services/
```

---

## Getting Started

### Backend
```bash
cd backend
# Configure application.properties with your MySQL credentials
./mvnw spring-boot:run
# Runs at http://localhost:8080
```

### Frontend
```bash
cd client
npm install
# Create .env with: VITE_API_BASE_URL=http://localhost:8080
npm run dev
# Runs at http://localhost:5173
```

### Database
```bash
mysql -u root -p mrmobi_db < backend/seed.sql
```

---

## API Endpoints

| Module | Endpoint |
|---|---|
| Auth | `/api/auth/**` |
| Products | `/api/products/**` |
| Cart | `/api/cart/**` |
| Orders | `/api/orders/**` |
| Wishlist | `/api/wishlist/**` |
| Admin | `/api/admin/**` |

---

## Author

**Satish Veesam** — Full-Stack Developer  
[GitHub](https://github.com/satishveesam) · [Repository](https://github.com/satishveesam/mrmobi-store_ecommerce_full-stack)
