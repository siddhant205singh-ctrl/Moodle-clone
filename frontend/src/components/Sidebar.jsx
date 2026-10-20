import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    onClose();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const itemStyle = (path) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 20px',
    fontSize: '13px',
    color: isActive(path) ? '#ff6600' : '#333',
    background: isActive(path) ? '#fff7f0' : 'transparent',
    borderLeft: isActive(path) ? '3px solid #ff6600' : '3px solid transparent',
    textDecoration: 'none',
    transition: 'background .15s, color .15s',
    cursor: 'pointer',
    fontFamily: 'inherit',
    width: '100%',
    border: 'none',
    textAlign: 'left',
  });

  const hoverProps = {
    onMouseEnter: e => { if (!e.currentTarget.style.borderLeftColor.includes('ff6600')) { e.currentTarget.style.background = '#f7f7f7'; } },
    onMouseLeave: e => { if (!e.currentTarget.style.borderLeftColor.includes('ff6600')) { e.currentTarget.style.background = 'transparent'; } },
  };

  return (
    /* Sidebar panel — fills the wrapper column that Layout controls */
      <div style={{
        width: '300px', height: '100%',
        background: '#fff',
        boxShadow: '2px 0 8px rgba(0,0,0,.12)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{ background: '#1e4f8a', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logo.png" alt="KIET" style={{ height: '36px', width: 'auto' }} />
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '13px' }}>KIET LMS</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer', lineHeight: 1, padding: '2px 4px' }}>
            ✕
          </button>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, overflowY: 'auto', paddingTop: '10px' }}>

          {/* Always visible */}
          <Link to="/" onClick={onClose} style={itemStyle('/')} {...hoverProps}>
            <span style={{ fontSize: '15px' }}>🏠</span> Home
          </Link>

          {/* Only when logged in */}
          {user ? (
            <>
              <div style={{ padding: '8px 20px 4px', fontSize: '10px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
                My Account
              </div>
              <Link to="/dashboard" onClick={onClose} style={itemStyle('/dashboard')} {...hoverProps}>
                <span style={{ fontSize: '15px' }}>📊</span> Dashboard
              </Link>
              <Link to="/profile" onClick={onClose} style={itemStyle('/profile')} {...hoverProps}>
                <span style={{ fontSize: '15px' }}>👤</span> Profile
              </Link>
              <Link to="/grades" onClick={onClose} style={itemStyle('/grades')} {...hoverProps}>
                <span style={{ fontSize: '15px' }}>📝</span> Grades
              </Link>

              <div style={{ margin: '6px 20px', borderTop: '1px solid #f0f0f0' }} />

              <div style={{ padding: '4px 20px 4px', fontSize: '10px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
                Learning
              </div>
              <Link to="/courses" onClick={onClose} style={itemStyle('/courses')} {...hoverProps}>
                <span style={{ fontSize: '15px' }}>📚</span> All Courses
              </Link>
              <Link to="/search" onClick={onClose} style={itemStyle('/search')} {...hoverProps}>
                <span style={{ fontSize: '15px' }}>🔍</span> Search Courses
              </Link>
              <Link to="/calendar" onClick={onClose} style={itemStyle('/calendar')} {...hoverProps}>
                <span style={{ fontSize: '15px' }}>📅</span> Calendar
              </Link>
              <Link to="/ebook" onClick={onClose} style={itemStyle('/ebook')} {...hoverProps}>
                <span style={{ fontSize: '15px' }}>📖</span> e-Book Bank
              </Link>
            </>
          ) : null}
        </nav>

        {/* Footer — user info or login prompt */}
        <div style={{ borderTop: '1px solid #eee', padding: '12px 16px', flexShrink: 0 }}>
          {user ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#1e4f8a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '15px', flexShrink: 0 }}>
                  {user.name?.[0] || '?'}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
                  <div style={{ fontSize: '11px', color: '#888', textTransform: 'capitalize' }}>{user.role}</div>
                </div>
              </div>
              <button onClick={handleLogout} style={{ width: '100%', padding: '7px', background: '#ff6600', color: '#fff', border: 'none', borderRadius: '3px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                Log out
              </button>
            </div>
          ) : (
            <Link to="/login" onClick={onClose} style={{ display: 'block', textAlign: 'center', padding: '8px', background: '#5f7a3a', color: '#fff', borderRadius: '3px', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}>
              Log in
            </Link>
          )}
        </div>
      </div>
  );
}
