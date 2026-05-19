import React, { useState, useEffect } from 'react';
import { BookCopy, Users, AlertTriangle, BookOpenCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchDashboard } from '../../api';

const DashboardCard = ({ title, value, icon, color, alert, link }) => (
  <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: `4px solid ${color}` }}>
    <div className="flex-between">
      <h3 style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '1rem', margin: 0 }}>{title}</h3>
      <div style={{ padding: '0.75rem', borderRadius: '50%', backgroundColor: `${color}20`, color: color }}>
        {icon}
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
      <span style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</span>
    </div>
    {alert && (
      <Link to={link} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger-text)', fontSize: '0.85rem', fontWeight: 600, marginTop: 'auto' }}>
        <AlertTriangle size={16} /> {alert}
      </Link>
    )}
  </div>
);

const LibrarianDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchDashboard().then(setStats).catch(console.error);
  }, []);

  if (!stats) return <div className="container" style={{padding: '2rem'}}>Đang tải dữ liệu...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h2 className="heading-2">Bảng điều khiển</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <DashboardCard 
          title="Tổng số cuốn sách" 
          value={stats.total_book_copies || 0} 
          icon={<BookCopy size={24} />} 
          color="var(--primary-500)" 
        />
        <DashboardCard 
          title="Phiếu đang hoạt động" 
          value={stats.active_loans || 0} 
          icon={<BookOpenCheck size={24} />} 
          color="var(--success-text)" 
        />
        <DashboardCard 
          title="Số độc giả" 
          value={stats.active_readers || 0}
          icon={<Users size={24} />} 
          color="var(--secondary-500)" 
        />
        <DashboardCard 
          title="Cảnh báo quá hạn" 
          value={stats.overdue_books || 0} 
          icon={<AlertTriangle size={24} />} 
          color="var(--danger-text)" 
          alert={stats.overdue_books > 0 ? `Có ${stats.overdue_books} sách quá hạn!` : null}
          link="/librarian/transactions"
        />
      </div>

      <div className="glass-panel" style={{ padding: '2rem', marginTop: '1rem' }}>
        <h3 className="heading-3" style={{ marginBottom: '1rem' }}>Thông tin tài chính</h3>
        <p style={{ color: 'var(--text-secondary)' }}>Tổng số tiền phạt chưa thu: <strong style={{ color: 'var(--danger-text)' }}>{Number(stats.unpaid_fines).toLocaleString()} ₫</strong></p>
      </div>
    </div>
  );
};

export default LibrarianDashboard;
