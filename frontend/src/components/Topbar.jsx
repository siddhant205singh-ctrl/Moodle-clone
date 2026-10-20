import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Topbar({ onSidebarToggle, sidebarOpen }) {
  const { user } = useAuth();

  return (
    <div style={{ background: '#1a1a1a', borderBottom: '1px solid #000', fontSize: '15px' }}
      className="text-white py-1 px-28 flex items-center justify-between min-h-[50px]">
      {/* Left — hamburger + contact info */}
      <div className="flex items-center gap-4 text-gray-300">
        {/* Sidebar toggle — animates to ✕ when open */}
        <button
          onClick={onSidebarToggle}
          title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px',
            width: '30px', height: '30px', position: 'relative', flexShrink: 0 }}
        >
          {/* Top bar — rotates to first arm of ✕ */}
          <span style={{
            position: 'absolute', left: '6px', top: sidebarOpen ? '14px' : '8px',
            width: '18px', height: '2px', background: '#ccc', borderRadius: '1px',
            transform: sidebarOpen ? 'rotate(45deg)' : 'rotate(0)',
            transition: 'top .25s, transform .25s',
          }} />
          {/* Middle bar — fades out */}
          <span style={{
            position: 'absolute', left: '6px', top: '14px',
            width: '18px', height: '2px', background: '#ccc', borderRadius: '1px',
            opacity: sidebarOpen ? 0 : 1,
            transition: 'opacity .2s',
          }} />
          {/* Bottom bar — rotates to second arm of ✕ */}
          <span style={{
            position: 'absolute', left: '6px', top: sidebarOpen ? '14px' : '20px',
            width: '18px', height: '2px', background: '#ccc', borderRadius: '1px',
            transform: sidebarOpen ? 'rotate(-45deg)' : 'rotate(0)',
            transition: 'top .25s, transform .25s',
          }} />
        </button>
        <span>📞 Call us : 8744097774</span>
        <span className="hidden sm:inline"></span>
        <span className="hidden sm:inline">✉ Email : itsupport@kiet.edu</span>
      </div>
      {/* Right — auth status */}
      <div className="flex items-center gap-1 text-gray-300">
        {user ? (
          <>
            <span className="hidden sm:inline">You are logged in as</span>
            <span className="font-semibold text-white">{user.name}</span>
          </>
        ) : (
          <span>
            You are not logged in.{' '}
            <Link to="/login" style={{ color: '#ff6600' }} className="hover:underline font-medium">
              (Log in)
            </Link>
          </span>
        )}
      </div>
    </div>
  );
}
