import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, BookMarked, CheckCircle2 } from 'lucide-react';
import { fetchBookDetail } from '../../api';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookDetail(id).then(data => {
      setBook(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [id]);
  
  if (loading) {
    return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Đang tải...</div>;
  }

  if (!book) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2>Sách không tồn tại</h2>
        <Link to="/reader" className="btn btn-outline" style={{ marginTop: '1rem' }}>Quay lại</Link>
      </div>
    );
  }

  const isAvailable = book.available_quantity > 0;

  return (
    <div style={{ padding: '2rem 0' }}>
      <button onClick={() => navigate(-1)} className="btn" style={{ marginBottom: '2rem', padding: 0, color: 'var(--text-secondary)' }}>
        <ArrowLeft size={20} /> Quay lại
      </button>

      <div className="glass-panel" style={{ display: 'flex', gap: '3rem', padding: '3rem' }}>
        {/* Left Column: Image */}
        {book.cover_image ? (
          <img src={book.cover_image} alt={book.title} style={{ width: '300px', height: '400px', objectFit: 'cover', borderRadius: 'var(--radius-md)', flexShrink: 0, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }} />
        ) : (
          <div style={{ width: '300px', flexShrink: 0, backgroundColor: 'var(--primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-md)', height: '400px' }}>
            <BookMarked size={100} color="var(--primary-300)" />
          </div>
        )}

        {/* Right Column: Details */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '1rem' }}>
            <span className="badge" style={{ backgroundColor: 'var(--primary-100)', color: 'var(--primary-700)', marginBottom: '1rem', display: 'inline-block' }}>
              {book.category_name}
            </span>
            <h1 className="heading-1" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{book.title}</h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>bởi <strong>{book.authors}</strong></p>
          </div>

          <div style={{ margin: '2rem 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Năm xuất bản</p>
              <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{book.published_year}</p>
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Mã ISBN</p>
              <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{book.isbn}</p>
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Vị trí kệ sách</p>
              <p style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--primary-600)' }}>{book.shelf_location || 'Chưa phân loại'}</p>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Tình trạng kho</p>
              <p style={{ fontWeight: 600, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: isAvailable ? 'var(--success-text)' : 'var(--danger-text)' }}>
                {isAvailable ? <CheckCircle2 size={20} /> : null}
                {isAvailable ? `Còn ${book.available_quantity} quyển` : 'Hết sách'}
              </p>
            </div>
          </div>

          <div style={{ marginTop: 'auto' }}>
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
              disabled={!isAvailable}
              onClick={() => alert('Vui lòng ra quầy thủ thư để mượn sách. (Phiên bản thực tế sẽ tự push notify cho thủ thư)')}
            >
              <BookMarked size={20} />
              {isAvailable ? 'Đăng ký mượn sách' : 'Không khả dụng'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
