import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header({ onMenuToggle, onSidebarToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLink = "px-3 py-1 text-[17px] text-[#ff6600] hover:text-[#ff6600] transition-colors duration-150 whitespace-nowrap";
  const isActive = (path) => location.pathname === path;

  return (
    <header style={{ background: '#fff', borderBottom: '2px solid #ff6600', boxShadow: '0 1px 4px rgba(0,0,0,.1)' }}>
      <div className="max-w-[1180px] mx-auto px-3 flex items-center justify-between" style={{ minHeight: '100px' }}>

        {/* ── Brand ── */}
        <Link to="/" className="flex items-center gap-3 no-underline py-1" style={{ textDecoration: 'none' }}>
          <img src="/logo.png" alt="KIET" style={{ height: '95px', width: 'auto' }} />
          <div style={{ lineHeight: 19 }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e4f8a', letterSpacing: '0.01em' }}>
           
            </div>
            <div style={{ fontSize: '15px', color: '#888', marginTop: '2px' }}>
             
            </div>
          </div>
        </Link>

        {/* ── Desktop nav ── */}
        <nav className="hidden md:flex items-center" style={{ gap: '2px' }}>
          <a href="https://erp.kiet.edu" target="_blank" rel="noreferrer" className={navLink}>KIET ERP PORTAL</a>
          <a href="https://www.kiet.edu"  target="_blank" rel="noreferrer" className={navLink}>KIET</a>
          <a href="https://www.aktu.ac.in" target="_blank" rel="noreferrer" className={navLink}>AKTU</a>
          <a href="https://www.aicte-india.org" target="_blank" rel="noreferrer" className={navLink}>AICTE</a>

          {/* Courses dropdown — click to toggle, stays open until item clicked or outside click */}
          <div className="relative">
            <button
              onClick={() => setCoursesOpen(o => !o)}
              style={{ fontSize: '17px', color: '#ff6600', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 12px', fontFamily: 'inherit' }}
              className="flex items-center gap-1 transition-colors"
            >
              Courses <span style={{ fontSize: '10px', marginLeft: '2px' }}>{coursesOpen ? '▴' : '▾'}</span>
            </button>
            {coursesOpen && (
              <>
                {/* invisible overlay to close on outside click */}
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 998 }}
                  onClick={() => setCoursesOpen(false)}
                />
                <div style={{ position: 'absolute', top: '100%', right: 0, background: '#fff', border: '1px solid #dee2e6', borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,.12)', minWidth: '160px', zIndex: 999 }}>
                  <Link
                    to="/courses"
                    style={{ display: 'block', padding: '8px 14px', fontSize: '13px', borderBottom: '1px solid #f0f0f0',
                      color: hoveredItem === 'courses' ? '#fff' : '#333',
                      background: hoveredItem === 'courses' ? '#49a52b' : 'transparent',
                      transition: 'background .15s, color .15s' }}
                    onMouseEnter={() => setHoveredItem('courses')}
                    onMouseLeave={() => setHoveredItem(null)}
                    onClick={() => { setCoursesOpen(false); setHoveredItem(null); }}
                  >All courses</Link>
                  <Link
                    to="/search"
                    style={{ display: 'block', padding: '8px 14px', fontSize: '13px',
                      color: hoveredItem === 'search' ? '#fff' : '#333',
                      background: hoveredItem === 'search' ? '#49a52b' : 'transparent',
                      transition: 'background .15s, color .15s' }}
                    onMouseEnter={() => setHoveredItem('search')}
                    onMouseLeave={() => setHoveredItem(null)}
                    onClick={() => { setCoursesOpen(false); setHoveredItem(null); }}
                  >Course search</Link>
                </div>
              </>
            )}
          </div>

          {/* Auth — only show Dashboard + Log out when logged in; no Log in button */}
          {user && (
            <>
              <Link to="/dashboard"
                style={{ fontSize: '13px', color: isActive('/dashboard') ? '#ff6600' : '#333', padding: '4px 10px' }}
                className="hover:text-[#ff6600] transition-colors">
                Dashboard
              </Link>
              <button onClick={handleLogout}
                className="btn-orange ml-2 text-[13px]">
                Log out
              </button>
            </>
          )}
        </nav>

        {/* ── Hamburger (mobile) ── */}
        <button onClick={onMenuToggle}
          className="md:hidden p-2 flex flex-col justify-center gap-1"
          aria-label="Open menu"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <span style={{ display: 'block', width: '22px', height: '2px', background: '#555' }}></span>
          <span style={{ display: 'block', width: '22px', height: '2px', background: '#555' }}></span>
          <span style={{ display: 'block', width: '22px', height: '2px', background: '#555' }}></span>
        </button>
      </div>
    </header>
  );
}
