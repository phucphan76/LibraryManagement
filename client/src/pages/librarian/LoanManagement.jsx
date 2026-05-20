import React, { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { fetchLoans } from '../../api';

const LoanManagement = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    try {
      setLoading(true);
      const data = await fetchLoans();
      setLoans(data);
    } catch (err) {
      alert('Lỗi tải danh sách phiếu mượn: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = 
      loan.loan_id.toString().includes(searchTerm) || 
      loan.reader_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active': return <span className="badge badge-warning"><Clock size={12} style={{ marginRight: '4px' }} /> Đang mượn</span>;
      case 'returned': return <span className="badge badge-success"><CheckCircle size={12} style={{ marginRight: '4px' }} /> Hoàn tất</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="flex-between">
        <h2 className="heading-2">Quản lý Phiếu mượn</h2>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '300px', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.5rem 1rem' }}>
            <Search size={20} color="var(--text-secondary)" />
            <input 
              type="text" 
              placeholder="Tìm theo mã phiếu hoặc tên độc giả..." 
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
              <option value="active">Đang mượn</option>
              <option value="returned">Hoàn tất</option>
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
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Mã phiếu</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Độc giả</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Ngày mượn</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Hạn trả</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Tiến độ trả sách</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {filteredLoans.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      Không tìm thấy phiếu mượn nào.
                    </td>
                  </tr>
                ) : (
                  filteredLoans.map(loan => {
                    const isOverdue = loan.status === 'active' && new Date() > new Date(loan.due_date);
                    return (
                      <tr key={loan.loan_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '1rem', fontWeight: 600 }}>#{loan.loan_id}</td>
                        <td style={{ padding: '1rem' }}>{loan.reader_name}</td>
                        <td style={{ padding: '1rem' }}>{new Date(loan.borrow_date).toLocaleDateString()}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ color: isOverdue ? 'var(--danger-text)' : 'inherit', fontWeight: isOverdue ? 600 : 'normal' }}>
                            {new Date(loan.due_date).toLocaleDateString()}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <BookOpen size={16} color="var(--primary-600)" />
                            <span style={{ fontWeight: 600 }}>{loan.returned_books} / {loan.total_books}</span> cuốn
                          </div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start' }}>
                            {getStatusBadge(loan.status)}
                            {isOverdue && (
                              <span className="badge badge-danger" style={{ fontSize: '0.7rem' }}>
                                <AlertCircle size={10} style={{ marginRight: '2px' }} /> Quá hạn
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoanManagement;
