import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useSocket } from '../context/SocketContext';

const formatDate = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
};

export default function ExpertDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const [expert, setExpert] = useState(null);
  const [slots, setSlots] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  useEffect(() => {
    fetchExpert();
  }, [id]);

  useEffect(() => {
    if (!socket) return undefined;

    socket.emit('join-expert-room', id);

    const handleSlotBooked = ({ date, timeSlot }) => {
      setSlots((prev) => {
        const updated = { ...prev };
        if (updated[date]) {
          updated[date] = updated[date].map((s) =>
            s.time === timeSlot ? { ...s, isBooked: true } : s
          );
        }
        return updated;
      });
    };

    const handleSlotFreed = ({ date, timeSlot }) => {
      setSlots((prev) => {
        const updated = { ...prev };
        if (updated[date]) {
          updated[date] = updated[date].map((s) =>
            s.time === timeSlot ? { ...s, isBooked: false } : s
          );
        }
        return updated;
      });
    };

    socket.on('slot-booked', handleSlotBooked);
    socket.on('slot-freed', handleSlotFreed);

    return () => {
      socket.emit('leave-expert-room', id);
      socket.off('slot-booked', handleSlotBooked);
      socket.off('slot-freed', handleSlotFreed);
    };
  }, [id, socket]);

  const fetchExpert = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/experts/${id}`);
      setExpert(data.data);
      setSlots(data.data.availableSlots || {});
      const firstDate = Object.keys(data.data.availableSlots || {})[0];
      if (firstDate) setSelectedDate(firstDate);
    } catch (err) {
      setError(err.displayMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="spinner" />;
  if (error) return (
    <div className="error-state">
      <div className="icon">⚠️</div>
      <h3>Failed to load expert</h3>
      <p>{error}</p>
      <button className="btn-outline" onClick={fetchExpert} style={{ marginTop: 16 }}>Retry</button>
    </div>
  );
  if (!expert) return null;

  const sortedDates = Object.keys(slots).sort();

  return (
    <div>
      <button className="back-btn" onClick={() => navigate(-1)}>← Back to experts</button>

      <div className="detail-layout">
        <div>
          <div className="expert-hero">
            <img
              className="hero-avatar"
              src={expert.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${expert._id}`}
              alt={expert.name}
            />
            <div className="hero-info">
              <div className="hero-name">{expert.name}</div>
              <span className="category-badge">{expert.category}</span>
              <div className="hero-meta">
                <div className="hero-meta-item">
                  <span className="text-amber-300">★ {expert.rating}</span>
                  <span>({expert.reviewCount} reviews)</span>
                </div>
                <div className="hero-meta-item">{expert.experience} years experience</div>
                <div className="hero-meta-item text-amber-200">
                  Rs {expert.hourlyRate} / hour
                </div>
              </div>
            </div>
          </div>

          <div className="bio-section">
            <div className="section-title">About</div>
            <p className="bio-text">{expert.bio}</p>
          </div>

          {expert.skills?.length > 0 && (
            <div className="bio-section">
              <div className="section-title">Skills & Expertise</div>
              <div className="skills">
                {expert.skills.map((s) => <span key={s} className="skill-tag">{s}</span>)}
              </div>
            </div>
          )}
        </div>

        <div className="slot-panel">
          <div className="slot-panel-title">Book a Session</div>
          <div className="realtime-badge">
            <span className="realtime-dot" />
            Live availability
          </div>

          {sortedDates.length === 0 ? (
            <div className="relative rounded-3xl border border-white/10 bg-white/[0.06] p-5 text-sm leading-6 text-slate-300">
              <p className="font-semibold text-white">Fresh slots are being prepared.</p>
              <p className="mt-1 text-slate-400">Refresh once, or reseed the database if this is old demo data.</p>
              <button className="btn-outline mt-4" onClick={fetchExpert}>Refresh availability</button>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
                {sortedDates.map((date) => (
                  <button
                    key={date}
                    className={`pill ${selectedDate === date ? 'active' : ''}`}
                    style={{ fontSize: 12, padding: '6px 12px' }}
                    onClick={() => { setSelectedDate(date); setSelectedTime(null); }}
                  >
                    {formatDate(date)}
                  </button>
                ))}
              </div>

              {selectedDate && slots[selectedDate] && (
                <div className="date-group">
                  <div className="date-label">{formatDate(selectedDate)}</div>
                  <div className="slot-grid">
                    {slots[selectedDate].map((slot) => (
                      <button
                        key={slot.time}
                        className={`slot-btn ${slot.isBooked ? 'booked' : ''} ${selectedTime === slot.time && !slot.isBooked ? 'selected' : ''}`}
                        disabled={slot.isBooked}
                        onClick={() => setSelectedTime(slot.isBooked ? null : slot.time)}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Link
                to={`/book/${expert._id}`}
                state={{ date: selectedDate, timeSlot: selectedTime, expertName: expert.name }}
                className="book-cta"
                style={{ pointerEvents: (!selectedDate || !selectedTime) ? 'none' : 'auto',
                         opacity: (!selectedDate || !selectedTime) ? 0.5 : 1 }}
              >
                {selectedTime ? `Book ${selectedTime} on ${formatDate(selectedDate)}` : 'Select a time slot'}
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
