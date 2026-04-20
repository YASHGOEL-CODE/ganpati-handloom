import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Loader from './components/common/Loader';
import ScrollToTop from './components/common/ScrollToTop';
import ProtectedRoute from './components/common/ProtectedRoute';

const AdminAnalytics           = lazy(() => import('./pages/Admin/AdminAnalytics'));
const AdminCoupons             = lazy(() => import('./pages/Admin/AdminCoupons'));
// ✅ NEW
const AdminFestiveCollections  = lazy(() => import('./pages/Admin/AdminFestiveCollections'));

const VerifyEmail          = lazy(() => import('./components/auth/VerifyEmail'));
const ResendVerification   = lazy(() => import('./components/auth/ResendVerification'));
const AddAddress           = lazy(() => import('./components/address/AddAddress'));
const EditAddress          = lazy(() => import('./components/address/EditAddress'));
const Home                 = lazy(() => import('./components/home/Home'));
const ProductList          = lazy(() => import('./components/products/ProductList'));
const ProductDetail        = lazy(() => import('./components/products/ProductDetail'));
const SignIn               = lazy(() => import('./components/auth/SignIn'));
const SignUp               = lazy(() => import('./components/auth/SignUp'));
const Cart                 = lazy(() => import('./components/cart/Cart'));
const Checkout             = lazy(() => import('./components/checkout/Checkout'));
const Profile              = lazy(() => import('./components/user/Profile'));
const Orders               = lazy(() => import('./components/user/Orders'));
const OrderDetail          = lazy(() => import('./components/user/OrderDetail'));
const Wishlist             = lazy(() => import('./components/user/Wishlist'));
const OurStory             = lazy(() => import('./components/pages/OurStory'));
const AboutUs              = lazy(() => import('./components/pages/AboutUs'));
const Services             = lazy(() => import('./components/pages/Services'));
const Contact              = lazy(() => import('./components/pages/Contact'));
const FAQ                  = lazy(() => import('./components/pages/FAQ'));
const Collections          = lazy(() => import('./components/pages/Collections'));
const AdminDashboard       = lazy(() => import('./pages/Admin/AdminDashboard'));
const AdminProducts        = lazy(() => import('./pages/Admin/AdminProducts'));
const AdminOrders          = lazy(() => import('./pages/Admin/AdminOrders'));
const AdminUsers           = lazy(() => import('./pages/Admin/AdminUsers'));
const AdminLayout          = lazy(() => import('./components/admin/AdminLayout'));
const AdminCategories      = lazy(() => import('./pages/Admin/AdminCategories'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader />
  </div>
);

function App() {
  return (
    <Router>
      <ScrollToTop />
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
                <Navbar />

                <main className="flex-grow">
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      {/* ✅ Public Routes */}
                      <Route path="/" element={<Home />} />
                      <Route path="/products" element={<ProductList />} />
                      <Route path="/products/:id" element={<ProductDetail />} />
                      <Route path="/signin" element={<SignIn />} />
                      <Route path="/signup" element={<SignUp />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/our-story" element={<OurStory />} />
                      <Route path="/about" element={<AboutUs />} />
                      <Route path="/services" element={<Services />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/faq" element={<FAQ />} />
                      <Route path="/collections" element={<Collections />} />
                      <Route path="/collections/:collectionName" element={<Collections />} />
                      <Route path="/verify-email/:token" element={<VerifyEmail />} />
                      <Route path="/resend-verification" element={<ResendVerification />} />

                      {/* ✅ Protected Routes — require login */}
                      <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                      <Route path="/profile"  element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                      <Route path="/orders"   element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                      <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
                      <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                      <Route path="/add-address"      element={<ProtectedRoute><AddAddress /></ProtectedRoute>} />
                      <Route path="/edit-address/:id" element={<ProtectedRoute><EditAddress /></ProtectedRoute>} />

                      {/* ✅ Admin Routes */}
                      <Route path="/admin" element={<ProtectedRoute><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
                      <Route path="/admin/products"   element={<ProtectedRoute><AdminLayout><AdminProducts /></AdminLayout></ProtectedRoute>} />
                      <Route path="/admin/orders"     element={<ProtectedRoute><AdminLayout><AdminOrders /></AdminLayout></ProtectedRoute>} />
                      <Route path="/admin/categories" element={<ProtectedRoute><AdminLayout><AdminCategories /></AdminLayout></ProtectedRoute>} />
                      <Route path="/admin/users"      element={<ProtectedRoute><AdminLayout><AdminUsers /></AdminLayout></ProtectedRoute>} />
                      <Route path="/admin/analytics"  element={<ProtectedRoute><AdminLayout><AdminAnalytics /></AdminLayout></ProtectedRoute>} />
                      <Route path="/admin/coupons"    element={<ProtectedRoute><AdminLayout><AdminCoupons /></AdminLayout></ProtectedRoute>} />

                      {/* ✅ NEW: Festive Collections admin route */}
                      <Route path="/admin/festive-collections" element={<ProtectedRoute><AdminLayout><AdminFestiveCollections /></AdminLayout></ProtectedRoute>} />
                    </Routes>
                  </Suspense>
                </main>

                <Footer />
              </div>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;