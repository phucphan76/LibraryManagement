import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { fetchBooks } from '../../api';

const BookManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks().then(data => {
      setBooks(data);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (book.isbn && book.isbn.includes(searchTerm))
  );

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sách này? (Chưa implement API xóa)')) {
      // Mock delete
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="flex-between">
        <h2 className="heading-2">Quản lý Sách</h2>
        <button className="btn btn-primary">
          <Plus size={20} /> Thêm sách mới
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', maxWidth: '400px', backgroundColor: 'rgba(255,255,255,0.5)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)' }}>
          <Search size={20} color="var(--text-secondary)" />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên hoặc ISBN..." 
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải...</div>
          ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(0,0,0,0.03)', borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ padding: '1rem', fontWeight: 600 }}>ID</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Tên sách</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Tác giả</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Thể loại</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>ISBN</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Vị trí kệ</th>
                <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'center' }}>Số lượng</th>
                <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'center' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map(book => (
                <tr key={book.book_id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background var(--transition-fast)' }} className="table-row-hover">
                  <td style={{ padding: '1rem' }}>#{book.book_id}</td>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{book.title}</td>
                  <td style={{ padding: '1rem' }}>{book.authors || '-'}</td>
                  <td style={{ padding: '1rem' }}>
                    <span className="badge" style={{ backgroundColor: 'var(--primary-100)', color: 'var(--primary-700)' }}>
                      {book.category_name}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>{book.isbn}</td>
                  <td style={{ padding: '1rem', color: 'var(--primary-600)', fontWeight: 500 }}>{book.shelf_location || '-'}</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <span style={{ fontWeight: 600, color: book.available_quantity > 0 ? 'var(--success-text)' : 'var(--danger-text)' }}>
                      {book.available_quantity} / {book.total_quantity}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <div className="flex-center" style={{ gap: '0.5rem' }}>
                      <button className="btn" style={{ padding: '0.5rem', color: 'var(--primary-600)', backgroundColor: 'var(--primary-50)' }}>
                        <Edit2 size={16} />
                      </button>
                      <button className="btn" style={{ padding: '0.5rem', color: 'var(--danger-text)', backgroundColor: 'var(--danger-bg)' }} onClick={() => handleDelete(book.book_id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
          {!loading && filteredBooks.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              Không tìm thấy kết quả nào.
            </div>
          )}
        </div>
        
        <div className="flex-between" style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          <span>Hiển thị {filteredBooks.length} kết quả</span>
        </div>
      </div>
      <style>{`
        .table-row-hover:hover {
          background-color: rgba(255,255,255,0.6);
        }
      `}</style>
    </div>
  );
};

export default BookManagement;
