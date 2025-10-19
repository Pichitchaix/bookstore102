import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import NotFound from './components/NotFound';
import ScrollToTop from './components/ScrollToTop';

// Pages
import HomePage from './pages/HomePage';
import BookListPage from './pages/BookListPage';
import BookDetailPage from './pages/BookDetailPage';
import CategoryPage from './pages/CategoryPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import AddBookPage from './pages/AddBookPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import EditBookPage from './pages/EditBookPage';
import DeleteBookPage from './pages/DeleteBookPage';

// ✅ Layout สำหรับหน้าทั่วไป (มี Navbar/Footer)
function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow bg-gray-50">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      {/* ใส่ตรงนี้ */}
      <ScrollToTop />

      <Routes>
        {/* Admin Routes - ไม่มี Navbar/Footer */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/store-manager/add-book" element={<AddBookPage />} />

        {/* Public Routes - มี Navbar/Footer */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/books" element={<BookListPage />} />
          <Route path="/books/:id" element={<BookDetailPage />} />
          <Route path="/categories" element={<CategoryPage />} />
          <Route path="/categories/:category" element={<CategoryPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/store-manager/dashboard" element={<AdminDashboardPage />} />
          <Route path="/store-manager/edit-book/:id" element={<EditBookPage />} />
          <Route path="/store-manager/delete-book" element={<DeleteBookPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
