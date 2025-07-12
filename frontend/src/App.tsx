import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
import NotFound from './components/NotFound';

import { getAuth } from './apis/auth';
import Login_ver2 from './components/Login_ver2';

function App() {

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    (async() => {
      setIsAuthenticated((await getAuth()).authenticated)
      setIsLoading(false);
    })();
  }, []);

  if (isLoading) {
    return <div className='flex justify-center items-center h-screen
     text-uiPrimary font-kalnia text-4xl'>Loading...</div>
  }

  return (
    <>
      <Routes>
        <Route path="*" element={<NotFound />} /> 
        <Route path="/" element={isAuthenticated ? <Navigate to="/browse" replace /> : <Navigate to="/home" replace />} />
        <Route path="/login" element={<AntiProtectedRoute><Login /></AntiProtectedRoute>} />
        <Route path="/login_ver2" element={<Login_ver2 />} />
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