import './App.css'
import { Routes, Route } from 'react-router-dom';

import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/Home';
import QuoteOfTheDay from './components/QuoteOfTheDay';
import Browse from './components/Browse';
import Search from './components/Search';
import Saved from './components/Saved';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/home" element={<Home />} />
      <Route path="quoteoftheday" element={<QuoteOfTheDay />} />
      <Route path="browse" element={<Browse />} />
      <Route path="search" element={<Search />} />
      <Route path="saved" element={<Saved />} />
    </Routes>
  );
}

export default App;