import React, { useState, useEffect } from 'react';
import { fetchMyBookshelf } from '../../api';
import { useAuth } from '../../contexts/AuthContext';

const getStatusBadge = (status) => {
  switch (status) {
    case 'borrowed':
      return <span className="badge badge-warning">Đang mượn</span>;
    case 'returned':
      return <span className="badge badge-success">Đã trả</span>;
    case 'overdue':
      return <span className="badge badge-danger">Quá hạn</span>;
    default:
      return null;
  }
};

const MyBookshelf = () => {
  const [myDetails, setMyDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser?.readerId) {
      fetchMyBookshelf(currentUser.readerId).then(data => {
        setMyDetails(data);
        setLoading(false);
      }).catch(console.error);
    }
  }, [currentUser]);

  return (
    <div style={{ padding: '2rem 0' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 className="heading-2">Tủ sách của tôi</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Lịch sử mượn và trả sách của bạn.</p>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>Đang tải...</div>
        ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Phiếu</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Tên sách</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Ngày mượn</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Hạn trả</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Ngày trả thực tế</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Tiền phạt</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {myDetails.map((detail, index) => {
              const isOverdue = !detail.return_date && new Date() > new Date(detail.due_date);
              const statusToDisplay = isOverdue ? 'overdue' : detail.status;
              
              return (
                <tr key={index} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background var(--transition-fast)' }} className="table-row-hover">
                  <td style={{ padding: '1rem 1.5rem' }}>#{detail.loan_id}</td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--primary-700)' }}>
                    {detail.title || 'Unknown'}
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>{new Date(detail.borrow_date).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>{new Date(detail.due_date).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>{detail.return_date ? new Date(detail.return_date).toLocaleDateString() : '-'}</td>
                  <td style={{ padding: '1rem 1.5rem', color: detail.fine > 0 ? 'var(--danger-text)' : 'inherit' }}>
                    {detail.fine > 0 ? `${Number(detail.fine).toLocaleString()} ₫` : '-'}
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    {getStatusBadge(statusToDisplay)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        )}
        {!loading && myDetails.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            Bạn chưa mượn cuốn sách nào.
          </div>
        )}
      </div>

      <style>{`
        .table-row-hover:hover {
          background-color: rgba(255,255,255,0.5);
        }
      `}</style>
    </div>
  );
};

export default MyBookshelf;
