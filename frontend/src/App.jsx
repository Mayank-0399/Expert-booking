import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import ExpertList from './pages/ExpertList';
import ExpertDetail from './pages/ExpertDetail';
import BookingForm from './pages/BookingForm';
import MyBookings from './pages/MyBookings';
import './App.css';

function App() {
  return (
    <SocketProvider>
      <BrowserRouter>
        <div className="app">
          <header className="header">
            <div className="header-inner">
              <NavLink to="/" className="logo">
                <span className="logo-icon">◈</span>
                <span className="logo-text">ExpertDock</span>
              </NavLink>
              <nav className="nav">
                <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Experts</NavLink>
                <NavLink to="/my-bookings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>My Sessions</NavLink>
              </nav>
            </div>
          </header>

          <main className="main">
            <Routes>
              <Route path="/" element={<ExpertList />} />
              <Route path="/experts/:id" element={<ExpertDetail />} />
              <Route path="/book/:id" element={<BookingForm />} />
              <Route path="/my-bookings" element={<MyBookings />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </SocketProvider>
  );
}

export default App;
