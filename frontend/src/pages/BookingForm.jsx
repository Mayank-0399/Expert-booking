import React, { useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

const validate = (form) => {
  const errs = {};
  if (!form.userName.trim() || form.userName.trim().length < 2) errs.userName = 'Name must be at least 2 characters';
  if (!form.userEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.userEmail)) errs.userEmail = 'Enter a valid email';
  if (!form.userPhone.trim() || !/^[+]?[\d\s\-()]{7,15}$/.test(form.userPhone)) errs.userPhone = 'Enter a valid phone number';
  if (form.notes.length > 500) errs.notes = 'Notes cannot exceed 500 characters';
  return errs;
};

export default function BookingForm() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const { date, timeSlot, expertName } = state || {};

  const [form, setForm] = useState({ userName: '', userEmail: '', userPhone: '', notes: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [booking, setBooking] = useState(null);

  if (!date || !timeSlot) {
    return (
      <div className="error-state">
        <div className="icon">⚠️</div>
        <h3>No time slot selected</h3>
        <p>Please go back and select a date and time.</p>
        <button className="btn-outline" style={{ marginTop: 16 }} onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: undefined }));
    setApiError(null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    setApiError(null);
    try {
      const { data } = await api.post('/bookings', {
        expertId: id,
        ...form,
        date,
        timeSlot,
      });
      setBooking(data.data);
      setSuccess(true);
    } catch (err) {
      setApiError(err.displayMessage || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}>
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h2 className="success-title">Session Booked!</h2>
          <p className="success-text">
            Your session with <strong>{expertName}</strong> is confirmed for<br />
            <strong>{formatDate(date)} at {timeSlot}</strong>.<br /><br />
            A confirmation will be sent to <strong>{form.userEmail}</strong>.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/my-bookings" className="submit-btn" style={{ width: 'auto', padding: '12px 24px', textDecoration: 'none', display: 'inline-block' }}>
              View My Bookings
            </Link>
            <Link to="/" className="btn-outline">Browse Experts</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

      <div className="page-header">
        <h1 className="page-title">Complete Your Booking</h1>
        <p className="page-subtitle">Session with <strong style={{ color: 'var(--accent)' }}>{expertName}</strong></p>
      </div>

      <div className="slot-summary">
        <strong>📅 {formatDate(date)} · ⏰ {timeSlot}</strong>
        This slot will be reserved once you confirm.
      </div>

      <div className="form-card">
        <form onSubmit={onSubmit} noValidate>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                className={`form-input ${errors.userName ? 'error' : ''}`}
                name="userName"
                value={form.userName}
                onChange={onChange}
                placeholder="John Doe"
                autoComplete="name"
              />
              {errors.userName && <span className="field-error">{errors.userName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                className={`form-input ${errors.userEmail ? 'error' : ''}`}
                name="userEmail"
                type="email"
                value={form.userEmail}
                onChange={onChange}
                placeholder="john@example.com"
                autoComplete="email"
              />
              {errors.userEmail && <span className="field-error">{errors.userEmail}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                className={`form-input ${errors.userPhone ? 'error' : ''}`}
                name="userPhone"
                type="tel"
                value={form.userPhone}
                onChange={onChange}
                placeholder="+91 98765 43210"
                autoComplete="tel"
              />
              {errors.userPhone && <span className="field-error">{errors.userPhone}</span>}
            </div>

            <div className="form-group" />

            <div className="form-group full">
              <label className="form-label">Notes / Questions (optional)</label>
              <textarea
                className="form-textarea"
                name="notes"
                value={form.notes}
                onChange={onChange}
                placeholder="What would you like to discuss in this session?"
                maxLength={500}
              />
              <span style={{ fontSize: 11, color: 'var(--text3)' }}>{form.notes.length}/500</span>
              {errors.notes && <span className="field-error">{errors.notes}</span>}
            </div>
          </div>

          {apiError && (
            <div style={{
              marginTop: 16,
              padding: '12px 16px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 10,
              color: 'var(--red)',
              fontSize: 14,
            }}>
              ⚠️ {apiError}
            </div>
          )}

          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? 'Booking...' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}
