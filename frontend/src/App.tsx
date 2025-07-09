import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/utils/ProtectedRoute';
import AntiProtectedRoute from './components/utils/AntiProtectedRoute';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/Home';
import QuoteOfTheDay from './components/QuoteOfTheDay';
import Browse from './components/Browse';
import Search from './components/Search';
import Saved from './components/Saved';
import LuckyQuote from './components/LuckyQuote';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/login" element={<AntiProtectedRoute><Login /></AntiProtectedRoute>} />
        <Route path="/signup" element={<AntiProtectedRoute><Signup /></AntiProtectedRoute>} />
        <Route path="/home" element={<Home />} />
        <Route path="/quote-of-the-day" element={<ProtectedRoute><QuoteOfTheDay /></ProtectedRoute>} />
        <Route path="/browse" element={<ProtectedRoute><Browse /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
        <Route path="/saved" element={<ProtectedRoute><Saved /></ProtectedRoute>} />
        <Route path="/lucky-quote" element={<ProtectedRoute><LuckyQuote /></ProtectedRoute>} />
      </Routes>
      <ToastContainer position="top-right" theme='dark' autoClose={3000} />
    </>
  );
}

export default App;