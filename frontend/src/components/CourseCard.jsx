import { Link } from 'react-router-dom';

export default function CourseCard({ course }) {
  return (
    <Link to={`/course/${course.slug}`} className="course-card block" style={{ textDecoration: 'none', color: 'inherit' }}>
      {/* Coloured header strip */}
      <div style={{
        background: course.color || '#1e4f8a',
        height: '80px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '8px 10px',
        position: 'relative',
      }}>
        <span style={{
          display: 'inline-block',
          background: 'rgba(0,0,0,.35)',
          color: '#fff',
          fontSize: '11px',
          fontFamily: 'monospace',
          padding: '2px 6px',
          borderRadius: '2px',
        }}>
          {course.code}
        </span>
      </div>
      {/* Card body */}
      <div style={{ padding: '10px', background: '#fff' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#333', margin: '0 0 4px', lineHeight: 1.4,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {course.title}
        </h3>
        <p style={{ fontSize: '12px', color: '#888', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {course.instructor}
        </p>
      </div>
    </Link>
  );
}
