import React, { useState, useEffect } from 'react';
import { Search, UserCheck, UserX } from 'lucide-react';
import { fetchReaders, updateReaderStatus } from '../../api';

const ReaderManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [readers, setReaders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReaders = () => {
    fetchReaders()
      .then(data => {
        setReaders(data);
        setLoading(false);
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadReaders();
  }, []);

  const filteredReaders = readers.filter(r => 
    r.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (r.phone && r.phone.includes(searchTerm)) ||
    (r.username && r.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const actionName = newStatus === 'active' ? 'Mở khóa' : 'Khóa';
    
    if (window.confirm(`Bạn có chắc chắn muốn ${actionName} tài khoản này?`)) {
      try {
        await updateReaderStatus(id, newStatus);
        alert(`${actionName} thành công!`);
        loadReaders();
      } catch (err) {
        alert(`Lỗi: ${err.message}`);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="flex-between">
        <h2 className="heading-2">Quản lý Độc giả</h2>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', maxWidth: '400px', backgroundColor: 'rgba(255,255,255,0.5)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)' }}>
          <Search size={20} color="var(--text-secondary)" />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên, SĐT, hoặc username..." 
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải danh sách độc giả...</div>
          ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(0,0,0,0.03)', borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Mã ĐG</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Tên Độc giả</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Username</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>SĐT</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Ngày tham gia</th>
                <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'center' }}>Trạng thái</th>
                <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'center' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredReaders.map(r => (
                <tr key={r.reader_id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background var(--transition-fast)' }} className="table-row-hover">
                  <td style={{ padding: '1rem' }}>#{r.reader_id}</td>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>
                    {r.full_name}
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{r.email}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>{r.username || '-'}</td>
                  <td style={{ padding: '1rem' }}>{r.phone}</td>
                  <td style={{ padding: '1rem' }}>{new Date(r.registered_date).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <span className={`badge ${r.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                      {r.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <div className="flex-center" style={{ gap: '0.5rem' }}>
                      {r.status === 'active' ? (
                        <button className="btn" style={{ padding: '0.5rem', color: 'var(--danger-text)', backgroundColor: 'var(--danger-bg)' }} onClick={() => handleToggleStatus(r.reader_id, r.status)} title="Khóa tài khoản">
                          <UserX size={16} />
                        </button>
                      ) : (
                        <button className="btn" style={{ padding: '0.5rem', color: 'var(--success-text)', backgroundColor: 'var(--success-bg)' }} onClick={() => handleToggleStatus(r.reader_id, r.status)} title="Mở khóa tài khoản">
                          <UserCheck size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
          {!loading && filteredReaders.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              Không tìm thấy độc giả nào phù hợp.
            </div>
          )}
        </div>
        
        <div className="flex-between" style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          <span>Hiển thị {filteredReaders.length} kết quả</span>
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

export default ReaderManagement;
