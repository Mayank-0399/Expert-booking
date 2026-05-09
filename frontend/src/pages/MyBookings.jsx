import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const STATUS_ORDER = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};

export default function MyBookings() {
  const [email, setEmail] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const fetchBookings = async (e) => {
    e?.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/bookings', { params: { email } });
      setBookings(data.data);
      setSearched(true);
    } catch (err) {
      setError(err.displayMessage);
    } finally {
      setLoading(false);
    }
  };

  const statusGroups = STATUS_ORDER.reduce((acc, status) => {
    const group = bookings.filter((b) => b.status === status);
    if (group.length) acc[status] = group;
    return acc;
  }, {});

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Sessions</h1>
        <p className="page-subtitle">Enter your email to view all your bookings</p>
      </div>

      <form className="email-lookup" onSubmit={fetchBookings}>
        <input
          className="search-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address..."
        />
        <button type="submit" className="lookup-btn" disabled={loading || !email.trim()}>
          {loading ? 'Loading...' : 'Find Bookings'}
        </button>
      </form>

      {error && (
        <div className="error-state">
          <div className="icon">⚠️</div>
          <h3>Something went wrong</h3>
          <p>{error}</p>
        </div>
      )}

      {searched && !loading && !error && bookings.length === 0 && (
        <div className="empty-state">
          <div className="icon">📭</div>
          <h3>No bookings found</h3>
          <p>No sessions found for <strong>{email}</strong></p>
          <Link to="/" className="btn-outline" style={{ marginTop: 16 }}>Browse Experts</Link>
        </div>
      )}

      {Object.entries(statusGroups).map(([status, items]) => (
        <div key={status} style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text2)' }}>{status}</h2>
            <span style={{
              padding: '2px 10px',
              borderRadius: 100,
              background: 'var(--surface)',
              fontSize: 12,
              color: 'var(--text3)'
            }}>{items.length}</span>
          </div>
          <div className="bookings-list">
            {items.map((booking) => (
              <div key={booking._id} className="booking-card">
                <img
                  style={{ width: 48, height: 48, borderRadius: '50%', flexShrink: 0, border: '2px solid var(--border2)', background: 'var(--surface2)' }}
                  src={booking.expert?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${booking.expert?._id}`}
                  alt={booking.expertName}
                />
                <div className="booking-info">
                  <div className="booking-expert">{booking.expertName}</div>
                  <div className="booking-meta">
                    <span>📅 {formatDate(booking.date)}</span>
                    <span>⏰ {booking.timeSlot}</span>
                    {booking.expert?.category && <span>🏷 {booking.expert.category}</span>}
                  </div>
                  {booking.notes && (
                    <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 6 }}>
                      💬 {booking.notes.length > 80 ? booking.notes.slice(0, 80) + '...' : booking.notes}
                    </p>
                  )}
                </div>
                <span className={`status-badge status-${booking.status}`}>{booking.status}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
