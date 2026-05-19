import React, { useState } from 'react';
import { Search, CheckCircle, Clock, Plus, Trash2, BookOpen } from 'lucide-react';
import { checkoutBooks, searchCheckin, returnBook, fetchBookDetail } from '../../api';

const TransactionManagement = () => {
  const [activeTab, setActiveTab] = useState('checkout');
  
  // Check-out State
  const [checkoutUserId, setCheckoutUserId] = useState('');
  const [checkoutBookInput, setCheckoutBookInput] = useState('');
  const [checkoutBooksList, setCheckoutBooksList] = useState([]);
  
  // Check-in State
  const [checkinSearchTerm, setCheckinSearchTerm] = useState('');
  const [checkinResult, setCheckinResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const defaultDueDate = new Date();
  defaultDueDate.setDate(defaultDueDate.getDate() + 30);

  const handleAddBookCheckout = async () => {
    if (!checkoutBookInput) return;
    if (checkoutBooksList.length >= 3) {
      alert('Độc giả chỉ được mượn tối đa 3 sách theo chính sách hiện tại!');
      return;
    }
    
    try {
      const book = await fetchBookDetail(checkoutBookInput);
      if (checkoutBooksList.find(b => b.book_id === book.book_id)) {
        alert('Sách này đã có trong danh sách mượn!');
        return;
      }
      setCheckoutBooksList([...checkoutBooksList, book]);
      setCheckoutBookInput('');
    } catch (e) {
      alert('Không tìm thấy sách hoặc sách không tồn tại!');
    }
  };

  const handleRemoveBookCheckout = (id) => {
    setCheckoutBooksList(checkoutBooksList.filter(b => b.book_id !== id));
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (checkoutBooksList.length === 0) {
      alert('Vui lòng thêm ít nhất 1 cuốn sách!');
      return;
    }
    try {
      const bookIds = checkoutBooksList.map(b => b.book_id);
      const res = await checkoutBooks(checkoutUserId, bookIds);
      alert(`Đã tạo phiếu mượn thành công! (Mã phiếu: ${res.loanId})`);
      setCheckoutUserId('');
      setCheckoutBooksList([]);
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  const handleCheckinSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await searchCheckin(checkinSearchTerm);
      setCheckinResult(data);
    } catch (err) {
      alert(err.message || 'Không tìm thấy phiếu mượn.');
      setCheckinResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReturnBook = async (detailId) => {
    try {
      await returnBook(detailId);
      alert(`Xác nhận trả sách thành công!`);
      // Update local state visually
      setCheckinResult({
        ...checkinResult,
        details: checkinResult.details.map(d => 
          d.detailId === detailId ? { ...d, returnStatus: 'returned' } : d
        )
      });
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h2 className="heading-2">Quản lý Mượn / Trả</h2>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button 
          className={`btn ${activeTab === 'checkout' ? 'btn-primary' : 'btn-outline'}`}
          style={activeTab !== 'checkout' ? { border: 'none' } : {}}
          onClick={() => setActiveTab('checkout')}
        >
          Tạo phiếu mượn (Check-out)
        </button>
        <button 
          className={`btn ${activeTab === 'checkin' ? 'btn-primary' : 'btn-outline'}`}
          style={activeTab !== 'checkin' ? { border: 'none' } : {}}
          onClick={() => setActiveTab('checkin')}
        >
          Xử lý trả sách (Check-in)
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', maxWidth: '800px' }}>
        
        {/* CHECK-OUT TAB */}
        {activeTab === 'checkout' && (
          <form onSubmit={handleCheckoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 className="heading-3">Tạo phiếu mượn mới</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 600 }}>Mã độc giả (User ID)</label>
              <input 
                type="text" 
                required
                value={checkoutUserId}
                onChange={(e) => setCheckoutUserId(e.target.value)}
                style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', outline: 'none' }}
                placeholder="Nhập mã độc giả..."
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 600 }}>Thêm sách vào phiếu (Tối đa 3)</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  value={checkoutBookInput}
                  onChange={(e) => setCheckoutBookInput(e.target.value)}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', outline: 'none' }}
                  placeholder="Nhập Mã sách (ID)..."
                />
                <button type="button" className="btn btn-outline" onClick={handleAddBookCheckout}>
                  <Plus size={20} /> Thêm sách
                </button>
              </div>
            </div>

            {checkoutBooksList.length > 0 && (
              <div style={{ backgroundColor: 'rgba(0,0,0,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Sách sẽ mượn ({checkoutBooksList.length}/3)</h4>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {checkoutBooksList.map(book => (
                    <li key={book.book_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BookOpen size={16} color="var(--primary-600)" />
                        <span><strong>#{book.book_id}</strong> - {book.title}</span>
                      </div>
                      <button type="button" className="btn" style={{ padding: '0.25rem', color: 'var(--danger-text)' }} onClick={() => handleRemoveBookCheckout(book.book_id)}>
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', backgroundColor: 'var(--primary-50)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <Clock size={20} color="var(--primary-600)" />
              <span>Hạn trả dự kiến (Chính sách 30 ngày): <strong style={{ color: 'var(--text-primary)' }}>{defaultDueDate.toLocaleDateString()}</strong></span>
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '1rem', marginTop: '1rem', fontSize: '1.1rem' }}>
              <CheckCircle size={20} /> Xác nhận tạo phiếu mượn
            </button>
          </form>
        )}

        {/* CHECK-IN TAB */}
        {activeTab === 'checkin' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 className="heading-3">Xử lý trả sách</h3>
            
            <form onSubmit={handleCheckinSearch} style={{ display: 'flex', gap: '1rem' }}>
              <input 
                type="text" 
                required
                value={checkinSearchTerm}
                onChange={(e) => setCheckinSearchTerm(e.target.value)}
                style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', outline: 'none' }}
                placeholder="Tìm theo Mã Phiếu mượn hoặc Mã độc giả..."
              />
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <Search size={20} /> {loading ? 'Đang tìm...' : 'Tìm kiếm'}
              </button>
            </form>

            {checkinResult && (
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                <div className="flex-between" style={{ marginBottom: '1rem' }}>
                  <h4 style={{ fontWeight: 600, color: 'var(--primary-700)' }}>Phiếu mượn #{checkinResult.id}</h4>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Mã / Tên độc giả</span>
                    <p style={{ fontWeight: 600 }}>{checkinResult.userId}</p>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Hạn trả chung</span>
                    <p style={{ fontWeight: 600 }}>{new Date(checkinResult.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <h4 style={{ fontWeight: 600, marginBottom: '1rem' }}>Chi tiết sách trong phiếu:</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {checkinResult.details.map(detail => {
                    return (
                      <div key={detail.detailId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: detail.returnStatus === 'returned' ? 'var(--success-bg)' : 'white' }}>
                        <div>
                          <p style={{ fontWeight: 600, margin: 0 }}>{detail.title}</p>
                          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            <span>Mã sách: #{detail.bookId}</span>
                            <span>Trạng thái: {detail.returnStatus === 'returned' ? 'Đã trả' : 'Đang mượn'}</span>
                          </div>
                          {detail.isOverdue && detail.returnStatus === 'borrowed' && (
                            <p style={{ color: 'var(--danger-text)', margin: '0.25rem 0 0', fontWeight: 600, fontSize: '0.85rem' }}>Quá hạn! Phạt: {Number(detail.fine).toLocaleString()} ₫</p>
                          )}
                        </div>
                        {detail.returnStatus === 'borrowed' ? (
                          <button onClick={() => handleReturnBook(detail.detailId)} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                            <CheckCircle size={16} /> Nhận trả sách
                          </button>
                        ) : (
                          <span style={{ color: 'var(--success-text)', fontWeight: 600 }}>Đã xử lý xong</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default TransactionManagement;
