# MrMobi Store — Full-Stack E-Commerce Platform

A full-stack e-commerce web application built with **Spring Boot** (REST API) and **React + Vite** (frontend). It includes a complete user-facing storefront, shopping cart, wishlist, checkout with address management, order tracking, product reviews, and a powerful admin dashboard.

---

## Tech Stack

### Backend
- Java 21
- Spring Boot 4.x
- Spring Security
- Spring Data JPA
- MySQL
- Lombok
- Spring Mail
- Maven

### Frontend
- React 19
- Vite
- Redux Toolkit
- React Router DOM v7
- Tailwind CSS
- Framer Motion
- Axios
- Recharts
- Lucide React / React Icons
- React Toastify

---

## Features

### User Storefront
- User registration and login with JWT authentication
- Browse products by category with search and filters
- Product detail page with image gallery and reviews
- Add to cart and manage cart items
- Wishlist management
- Checkout with saved address management
- Order placement and order history tracking
- User profile management

### Admin Dashboard
- Secure admin login
- Dashboard with analytics and charts (Recharts)
- Product management — add, edit, delete, stock control
- Category management with icons
- Banner management
- Order management and shipping
- User management
- Review moderation
- Out-of-stock product tracking

---

## Project Structure

```
mrmobi-store_ecommerce_full-stack/
├── backend/                        # Spring Boot REST API
│   └── src/main/java/com/mrmobi/ecommerce/
│       ├── controller/             # REST Controllers
│       ├── entity/                 # JPA Entities
│       ├── dto/                    # Data Transfer Objects
│       ├── repository/             # JPA Repositories
│       ├── service/                # Business Logic
│       ├── security/               # JWT & Spring Security
│       ├── config/                 # App Configuration
│       ├── exception/              # Global Exception Handling
│       └── util/                   # Utility Classes
│
└── client/                         # React + Vite Frontend
    └── src/
        ├── pages/
        │   ├── user/               # Home, Cart, Checkout, Orders, Profile...
        │   └── admin/              # Dashboard, Products, Categories, Orders...
        ├── components/             # Reusable UI Components
        ├── redux/                  # Redux Toolkit Store & Slices
        ├── services/               # Axios API Service Calls
        ├── hooks/                  # Custom React Hooks
        ├── routes/                 # Route Definitions
        └── utils/                  # Helper Utilities
```

---

## API Endpoints (Overview)

| Module | Endpoint |
|---|---|
| Auth | `/api/auth/**` |
| Products | `/api/products/**` |
| Categories | `/api/categories/**` |
| Cart | `/api/cart/**` |
| Wishlist | `/api/wishlist/**` |
| Orders | `/api/orders/**` |
| Reviews | `/api/reviews/**` |
| Banners | `/api/banners/**` |
| Admin | `/api/admin/**` |
| User Address | `/api/addresses/**` |
| File Upload | `/api/files/**` |

---

## Getting Started

### Prerequisites
- Java 21+
- Node.js 18+
- MySQL 8+
- Maven

---

### Backend Setup

1. Clone the repository
   ```bash
   git clone https://github.com/satishveesam/mrmobi-store_ecommerce_full-stack.git
   cd mrmobi-store_ecommerce_full-stack/backend
   ```

2. Configure the database in `src/main/resources/application.properties`
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/mrmobi_db
   spring.datasource.username=your_mysql_username
   spring.datasource.password=your_mysql_password
   spring.jpa.hibernate.ddl-auto=update
   ```

3. Run the Spring Boot application
   ```bash
   ./mvnw spring-boot:run
   ```
   The API will start at `http://localhost:8080`

---

### Frontend Setup

1. Navigate to the client folder
   ```bash
   cd ../client
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file in the `client/` folder
   ```env
   VITE_API_BASE_URL=http://localhost:8080
   ```

4. Start the development server
   ```bash
   npm run dev
   ```
   The app will run at `http://localhost:5173`

---

## Environment Variables

### Backend (`application.properties`)
| Variable | Description |
|---|---|
| `spring.datasource.url` | MySQL connection URL |
| `spring.datasource.username` | Database username |
| `spring.datasource.password` | Database password |
| `spring.mail.*` | Mail server config for email features |
| `jwt.secret` | Secret key for JWT token signing |

### Frontend (`.env`)
| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend API base URL |

---

## Database

- Database: **MySQL**
- A seed SQL file is available at `backend/seed.sql` to populate initial data

```bash
mysql -u root -p mrmobi_db < backend/seed.sql
```

---

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License

This project is for educational and portfolio purposes.

---

## Author

**Satish Veesam**  
Full-Stack Developer  
[GitHub](https://github.com/satishveesam)  
[Repository](https://github.com/satishveesam/mrmobi-store_ecommerce_full-stack)
