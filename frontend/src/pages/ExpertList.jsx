import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const CATEGORIES = ['All', 'Technology', 'Finance', 'Health', 'Legal', 'Marketing', 'Design', 'Business', 'Education'];

function SkeletonCard() {
  return (
    <div className="skeleton">
      <div className="card-top">
        <div className="skel" style={{ width: 52, height: 52, borderRadius: '50%' }} />
        <div style={{ flex: 1 }}>
          <div className="skel" style={{ height: 18, width: '70%', marginBottom: 8 }} />
          <div className="skel" style={{ height: 14, width: '40%' }} />
        </div>
      </div>
      <div className="skel" style={{ height: 13, marginBottom: 6 }} />
      <div className="skel" style={{ height: 13, width: '80%', marginBottom: 20 }} />
      <div className="skel" style={{ height: 1, marginBottom: 14 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div className="skel" style={{ height: 14, width: '35%' }} />
        <div className="skel" style={{ height: 14, width: '25%' }} />
      </div>
    </div>
  );
}

export default function ExpertList() {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchExperts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 8 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (category !== 'All') params.category = category;
      const { data } = await api.get('/experts', { params });
      setExperts(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.displayMessage);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, category]);

  useEffect(() => {
    fetchExperts();
  }, [fetchExperts]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category]);

  const renderStars = (rating) => '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Find Your Expert</h1>
        <p className="page-subtitle">Book 1-on-1 sessions with world-class professionals</p>
      </div>

      <div className="filters">
        <input
          className="search-input"
          placeholder="Search by name or expertise..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="filter-pills" style={{ marginBottom: 28 }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`pill ${category === cat ? 'active' : ''}`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {error ? (
        <div className="error-state">
          <div className="icon">⚠️</div>
          <h3>Failed to load experts</h3>
          <p>{error}</p>
          <button className="btn-outline" onClick={fetchExperts} style={{ marginTop: 16 }}>Retry</button>
        </div>
      ) : loading ? (
        <div className="loading-grid">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : experts.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🔍</div>
          <h3>No experts found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className="expert-grid">
            {experts.map((expert) => (
              <Link key={expert._id} to={`/experts/${expert._id}`} className="expert-card">
                <div className="card-top">
                  <img
                    className="expert-avatar"
                    src={expert.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${expert._id}`}
                    alt={expert.name}
                  />
                  <div className="card-info">
                    <div className="expert-name">{expert.name}</div>
                    <span className="category-badge">{expert.category}</span>
                  </div>
                </div>
                <p className="expert-bio">{expert.bio}</p>
                <div className="card-meta">
                  <div className="meta-item">
                    <span className="star">{renderStars(expert.rating)}</span>
                    <span className="meta-value">{expert.rating}</span>
                    <span className="meta-label">({expert.reviewCount})</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">{expert.experience}y exp</span>
                    <span className="rate"> · ₹{expert.hourlyRate}/hr</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="pagination">
              <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page === pagination.pages}>›</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
