import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, Link } from 'react-router-dom';
import { BookOpen, User, LogOut, LayoutDashboard, Settings } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Reader Pages
import ReaderHome from './pages/reader/Home';
import BookDetail from './pages/reader/BookDetail';
import MyBookshelf from './pages/reader/MyBookshelf';

// Librarian Pages
import LibrarianDashboard from './pages/librarian/Dashboard';
import BookManagement from './pages/librarian/BookManagement';
import TransactionManagement from './pages/librarian/TransactionManagement';
import ReaderManagement from './pages/librarian/ReaderManagement';
import LoanManagement from './pages/librarian/LoanManagement';

// Protected Route Wrapper
const ProtectedRoute = ({ allowedRoles }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) return <Navigate to="/login" replace />;
  
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />; // Redirect if not authorized
  }

  return <Outlet />;
};

// Layouts
const ReaderLayout = () => {
  const { currentUser, logout } = useAuth();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', display: 'flex', flexDirection: 'column' }}>
      {/* Reader Navbar */}
      <nav className="glass-panel" style={{ position: 'sticky', top: 0, zIndex: 10, borderRadius: 0 }}>
        <div className="container flex-between" style={{ padding: '1rem 0' }}>
          <div className="flex-center" style={{ gap: '0.75rem', color: 'var(--primary-600)' }}>
            <BookOpen size={28} />
            <h1 className="heading-2" style={{ margin: 0, fontSize: '1.5rem' }}>OpenLibrary</h1>
          </div>
          
          <div className="flex-center" style={{ gap: '2rem' }}>
            <Link to="/reader" style={{ color: 'var(--text-primary)', fontWeight: 500, textDecoration: 'none' }}>Khám phá</Link>
            <Link to="/reader/bookshelf" style={{ color: 'var(--text-primary)', fontWeight: 500, textDecoration: 'none' }}>Tủ sách của tôi</Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem' }}>
              <span style={{ fontWeight: 600 }}>{currentUser?.username}</span>
              <button onClick={logout} className="btn btn-outline" style={{ padding: '0.5rem' }} title="Đăng xuất">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container" style={{ flex: 1 }}>
        <Outlet />
      </div>
    </div>
  );
};

const LibrarianLayout = () => {
  const { currentUser, logout } = useAuth();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', display: 'flex' }}>
      {/* Librarian Sidebar */}
      <aside className="glass-panel" style={{ width: '260px', borderRadius: 0, display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh' }}>
        <div className="flex-center" style={{ gap: '0.75rem', color: 'var(--primary-600)', padding: '2rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <BookOpen size={28} />
          <h1 className="heading-2" style={{ margin: 0, fontSize: '1.25rem' }}>Thư Viện Admin</h1>
        </div>
        
        <nav style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <Link to="/librarian" className="btn" style={{ justifyContent: 'flex-start', color: 'var(--text-secondary)', padding: '0.75rem 1rem' }}>
            <LayoutDashboard size={20} /> Bảng điều khiển
          </Link>
          <Link to="/librarian/books" className="btn" style={{ justifyContent: 'flex-start', color: 'var(--text-secondary)', padding: '0.75rem 1rem' }}>
            <BookOpen size={20} /> Quản lý Sách
          </Link>
          <Link to="/librarian/transactions" className="btn" style={{ justifyContent: 'flex-start', color: 'var(--text-secondary)', padding: '0.75rem 1rem' }}>
            <Settings size={20} /> Mượn / Trả sách
          </Link>
          <Link to="/librarian/loans" className="btn" style={{ justifyContent: 'flex-start', color: 'var(--text-secondary)', padding: '0.75rem 1rem' }}>
            <BookOpen size={20} /> Quản lý Phiếu mượn
          </Link>
          <Link to="/librarian/readers" className="btn" style={{ justifyContent: 'flex-start', color: 'var(--text-secondary)', padding: '0.75rem 1rem' }}>
            <User size={20} /> Quản lý Độc giả
          </Link>
        </nav>

        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary-100)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
              {currentUser?.username?.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{currentUser?.username}</span>
          </div>
          <button onClick={logout} className="btn btn-outline" style={{ padding: '0.4rem', border: 'none' }} title="Đăng xuất">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: '2rem', height: '100vh', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
};

function AppRoutes() {
  const { currentUser } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={<Navigate to={currentUser ? (currentUser.role === 'reader' ? '/reader' : '/librarian') : '/login'} replace />} />
      <Route path="/login" element={currentUser ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={currentUser ? <Navigate to="/" replace /> : <Register />} />

      {/* Reader Routes */}
      <Route element={<ProtectedRoute allowedRoles={['reader']} />}>
        <Route path="/reader" element={<ReaderLayout />}>
          <Route index element={<ReaderHome />} />
          <Route path="book/:id" element={<BookDetail />} />
          <Route path="bookshelf" element={<MyBookshelf />} />
        </Route>
      </Route>

      {/* Librarian Routes */}
      <Route element={<ProtectedRoute allowedRoles={['librarian', 'admin']} />}>
        <Route path="/librarian" element={<LibrarianLayout />}>
          <Route index element={<LibrarianDashboard />} />
          <Route path="books" element={<BookManagement />} />
          <Route path="transactions" element={<TransactionManagement />} />
          <Route path="readers" element={<ReaderManagement />} />
          <Route path="loans" element={<LoanManagement />} />
        </Route>
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
