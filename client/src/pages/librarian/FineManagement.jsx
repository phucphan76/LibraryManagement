import React, { useState, useEffect } from 'react';
import { Search, Filter, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import { fetchFines, payFine } from '../../api';

const FineManagement = () => {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadFines();
  }, []);

  const loadFines = async () => {
    try {
      setLoading(true);
      const data = await fetchFines();
      setFines(data);
    } catch (err) {
      alert('Lỗi tải danh sách phạt: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (fineId) => {
    if (!window.confirm('Xác nhận độc giả đã thanh toán khoản phạt này? Hành động không thể hoàn tác.')) {
      return;
    }
    try {
      await payFine(fineId);
      // Reload danh sách sau khi thanh toán thành công
      loadFines();
    } catch (err) {
      alert('Lỗi khi thu tiền: ' + err.message);
    }
  };

  const filteredFines = fines.filter(fine => {
    const matchesSearch = 
      fine.reader_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (fine.phone && fine.phone.includes(searchTerm));
    const matchesStatus = statusFilter === 'all' || fine.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'unpaid': return <span className="badge badge-danger"><AlertCircle size={12} style={{ marginRight: '4px' }} /> Chưa thanh toán</span>;
      case 'paid': return <span className="badge badge-success"><CheckCircle size={12} style={{ marginRight: '4px' }} /> Đã thanh toán</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="flex-between">
        <h2 className="heading-2">Quản lý Phạt</h2>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '300px', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.5rem 1rem' }}>
            <Search size={20} color="var(--text-secondary)" />
            <input 
              type="text" 
              placeholder="Tìm theo tên độc giả hoặc SĐT..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.5rem 1rem' }}>
            <Filter size={20} color="var(--text-secondary)" />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ border: 'none', outline: 'none', background: 'transparent', cursor: 'pointer' }}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="unpaid">Chưa thanh toán</option>
              <option value="paid">Đã thanh toán</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>Đang tải dữ liệu...</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Mã phạt</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Mã phiếu mượn</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Độc giả</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Số ngày trễ</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Số tiền</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Trạng thái</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredFines.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      Không tìm thấy biên lai phạt nào.
                    </td>
                  </tr>
                ) : (
                  filteredFines.map(fine => (
                    <tr key={fine.fine_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>#{fine.fine_id}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ color: 'var(--primary-600)', fontWeight: 500 }}>#{fine.loan_id}</span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: 500 }}>{fine.reader_name}</p>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{fine.phone}</p>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ color: 'var(--danger-text)', fontWeight: 600 }}>{fine.overdue_days} ngày</span>
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--primary-700)' }}>
                        {parseInt(fine.fine_amount).toLocaleString('vi-VN')} VNĐ
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {getStatusBadge(fine.status)}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        {fine.status === 'unpaid' ? (
                          <button 
                            className="btn btn-primary" 
                            style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                            onClick={() => handlePay(fine.fine_id)}
                          >
                            <DollarSign size={16} /> Đã thu tiền
                          </button>
                        ) : (
                          <span style={{ color: 'var(--success-text)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                            <CheckCircle size={16} /> Hoàn tất
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default FineManagement;
