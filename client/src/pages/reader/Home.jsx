import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, BookOpen } from 'lucide-react';
import { fetchBooks, fetchCategories } from '../../api';

const ReaderHome = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchBooks(), fetchCategories()])
      .then(([booksData, categoriesData]) => {
        setBooks(booksData);
        setCategories(categoriesData);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || book.category_name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ display: 'flex', gap: '2rem', padding: '2rem 0' }}>
      {/* Sidebar Filter */}
      <aside className="glass-panel" style={{ width: '280px', padding: '1.5rem', height: 'fit-content' }}>
        <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Filter size={20} color="var(--primary-600)" />
          <h3 className="heading-3">Bộ lọc</h3>
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Thể loại</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ display: 'flex', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="radio" name="category" value="all" checked={selectedCategory === 'all'} onChange={(e) => setSelectedCategory(e.target.value)} />
              Tất cả
            </label>
            {categories.map(cat => (
              <label key={cat.category_id} style={{ display: 'flex', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="radio" name="category" value={cat.category_name} checked={selectedCategory === cat.category_name} onChange={(e) => setSelectedCategory(e.target.value)} />
                {cat.category_name}
              </label>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1 }}>
        <div className="glass-panel" style={{ padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Search size={20} color="var(--text-secondary)" />
          <input 
            type="text" 
            placeholder="Tìm kiếm tên sách..." 
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '1rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>Đang tải danh sách sách...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {filteredBooks.map(book => (
              <div key={book.book_id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {book.cover_image ? (
                  <img src={book.cover_image} alt={book.title} style={{ width: '100%', height: '300px', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '300px', backgroundColor: 'var(--primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={48} color="var(--primary-300)" />
                  </div>
                )}
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.5rem' }}>
                  <h4 style={{ fontWeight: 700, fontSize: '1.1rem', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{book.title}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                    {book.authors}
                  </p>
                  <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {book.available_quantity > 0 ? (
                      <span className="badge badge-success">Khả dụng</span>
                    ) : (
                      <span className="badge badge-danger">Hết sách</span>
                    )}
                    <Link to={`/reader/book/${book.book_id}`} className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}>
                      <BookOpen size={16} /> Chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && filteredBooks.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            Không tìm thấy sách nào phù hợp.
          </div>
        )}
      </main>
    </div>
  );
};

export default ReaderHome;
