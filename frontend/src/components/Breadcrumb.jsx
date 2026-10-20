import { Link } from 'react-router-dom';

export default function Breadcrumb({ links = [] }) {
  return (
    <nav className="moodle-breadcrumb">
      {links.map((link, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {i > 0 && <span style={{ color: '#bbb', fontSize: '12px' }}>›</span>}
          {link.href ? (
            <Link to={link.href} style={{ color: '#1177d1', fontSize: '12px' }} className="hover:underline">
              {link.label}
            </Link>
          ) : (
            <span style={{ color: '#555', fontSize: '12px' }}>{link.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
