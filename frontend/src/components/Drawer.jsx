import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Drawer({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    onClose();
    navigate('/login');
  };

  const item = "block py-2.5 px-4 text-[13px] text-[#333] border-b border-[#eee] hover:bg-[#f7f7f7] hover:text-[#ff6600] no-underline";

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden"
          style={{ background: 'rgba(0,0,0,.45)' }}
          onClick={onClose} />
      )}

      {/* Panel */}
      <div className={`fixed top-0 left-0 h-full z-50 md:hidden transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ width: '280px', background: '#fff', boxShadow: '4px 0 16px rgba(0,0,0,.2)' }}>

        {/* Header */}
        <div style={{ background: '#1e4f8a', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>KIET LMS</span>
          <button onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer', lineHeight: 1 }}>
            ✕
          </button>
        </div>

        {/* Nav items */}
        <nav>
          <Link to="/"         onClick={onClose} className={item}>🏠 Home</Link>
          <Link to="/courses"  onClick={onClose} className={item}>📚 All Courses</Link>
          <Link to="/search"   onClick={onClose} className={item}>🔍 Search Courses</Link>
          <Link to="/calendar" onClick={onClose} className={item}>📅 Calendar</Link>
          <Link to="/ebook"    onClick={onClose} className={item}>📖 e-Book Bank</Link>

          {user ? (
            <>
              <div style={{ background: '#f7f7f7', padding: '6px 16px', fontSize: '11px', color: '#999', borderBottom: '1px solid #eee', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {user.name}
              </div>
              <Link to="/dashboard" onClick={onClose} className={item}>📊 Dashboard</Link>
              <Link to="/profile"   onClick={onClose} className={item}>👤 Profile</Link>
              <Link to="/grades"    onClick={onClose} className={item}>📝 Grades</Link>
              <button onClick={handleLogout}
                style={{ width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: '13px', color: '#cc0000', background: 'none', border: 'none', borderBottom: '1px solid #eee', cursor: 'pointer', fontFamily: 'inherit' }}
                className="hover:bg-red-50">
                🚪 Log out
              </button>
            </>
          ) : (
            <Link to="/login" onClick={onClose}
              style={{ display: 'block', padding: '10px 16px', fontSize: '13px', color: '#fff', background: '#5f7a3a', textDecoration: 'none', margin: '12px 16px', borderRadius: '3px', textAlign: 'center' }}>
              Log in
            </Link>
          )}
        </nav>
      </div>
    </>
  );
}
