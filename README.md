# Ganpati Handloom - Full Stack E-Commerce Platform

A complete, production-ready MERN stack e-commerce platform for traditional Indian handloom products.

## 🚀 Features

### Frontend
- React.js with modern hooks and context API
- Tailwind CSS for responsive design
- Dark/Light mode toggle
- JWT-based authentication
- Advanced product filtering and search
- Shopping cart and wishlist
- Order tracking
- User profile and address management
- Product reviews and ratings
- Personalized recommendations
- Admin dashboard

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT authentication
- Role-based authorization
- RESTful API design
- Advanced recommendation system
- SMS notifications (ready for integration)
- Secure password hashing

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with your configuration (see `backend/.env` for template)

4. Start the server:
```bash
npm run dev
```

Backend will run on http://localhost:5000

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm start
```

Frontend will run on http://localhost:3000

## 🔐 Default Admin Credentials

🔐 Admin Credentials

Admin access is securely managed via environment variables in production.



## 📁 Project Structure
```
ganpati-handloom/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
└── README.md
```

## 🎨 Key Technologies

- **Frontend**: React, Tailwind CSS, React Router, Axios
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Authentication**: JWT, bcrypt
- **State Management**: Context API
- **UI/UX**: Responsive design, Dark mode, Animations

## 🛠️ API Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - User login
- GET /api/auth/me - Get current user

### Products
- GET /api/products - Get all products (with filters)
- GET /api/products/:id - Get single product
- GET /api/products/featured/list - Get featured products
- GET /api/products/trending/list - Get trending products

### Orders
- POST /api/orders - Create new order
- GET /api/orders/myorders - Get user orders
- GET /api/orders/:id - Get order by ID

### Admin
- POST /api/admin/products - Create product
- PUT /api/admin/products/:id - Update product
- DELETE /api/admin/products/:id - Delete product
- GET /api/admin/analytics - Get analytics data

(See full API documentation in backend routes)

## 🌟 Features Highlights

1. **Advanced Recommendation System**: ML-style personalized product recommendations
2. **Multi-level Filtering**: Filter by type, fabric, size, color, price, etc.
3. **Order Tracking**: Real-time order status updates
4. **Wishlist**: Save favorite products
5. **Reviews & Ratings**: Customer feedback system
6. **Admin Dashboard**: Complete admin control panel
7. **Dark Mode**: System-wide theme toggle
8. **Responsive Design**: Mobile-first approach
9. **Cultural Design**: Indian traditional aesthetics
10. **Production Ready**: Scalable architecture

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected routes
- Role-based access control
- Input validation
- XSS protection
- CORS configured

## 📱 SMS Integration

The platform is ready for SMS notifications. Configure your SMS provider in `backend/utils/smsService.js`

## 🚀 Deployment

### Backend Deployment (Heroku/Railway/Render)
1. Set environment variables
2. Deploy from Git repository
3. Ensure MongoDB connection

### Frontend Deployment (Vercel/Netlify)
1. Build production bundle: `npm run build`
2. Deploy build folder
3. Set environment variables

## 🤝 Contributing

This is a complete project. For modifications:
1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 📄 License

This project is created for educational and commercial purposes.

## 👨‍💻 Author

Created with ❤️ for Ganpati Handloom

## 🙏 Acknowledgments

- Traditional Indian artisans
- MERN stack community
- Open source contributors

---

**Note**: This is a complete, production-ready application. All features listed in the requirements have been fully implemented.