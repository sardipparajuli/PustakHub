import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import BookInfo from './pages/BookInfo';
import Profile from './pages/Profile';
import AddBook from './pages/AddBook';
import Wishlist from './pages/Wishlist';
import Chat from './pages/Chat';
import EditBook from './pages/EditBook';
import Payment from './pages/Payment';
import PaymentSuccess from './pages/PaymentSuccess';
import Inbox from './pages/Inbox';
import Cart from './pages/Cart';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/book/:id" element={<BookInfo />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/add-book" element={<AddBook />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/chat/:userId" element={<Chat />} />
        <Route path="/edit-book/:id" element={<EditBook />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/failure" element={<PaymentSuccess />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;