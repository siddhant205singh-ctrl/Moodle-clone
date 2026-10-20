import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import Breadcrumb from '../components/Breadcrumb';

const TYPE_ICON = {
  forum:  '💬', page: '📄', file: '📎',
  url:    '🔗', assign: '📝', quiz: '❓', video: '🎥',
};
const TYPE_LABEL = {
  forum: 'Forum', page: 'Page', file: 'File',
  url: 'URL', assign: 'Assignment', quiz: 'Quiz', video: 'Video',
};

function TopicSection({ topic, courseId }) {
  const [open, setOpen] = useState(true);

  return (
    <div style={{ border: '1px solid #dee2e6', borderRadius: '4px', marginBottom: '10px', overflow: 'hidden' }}>
      {/* Topic header */}
      <button onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px', background: '#f7f7f7', border: 'none',
          borderBottom: open ? '1px solid #dee2e6' : 'none',
          cursor: 'pointer', fontFamily: 'inherit',
          fontSize: '13px', fontWeight: 700, color: '#333', textAlign: 'left',
        }}>
        <span>{topic.title}</span>
        <span style={{ fontSize: '11px', color: '#999' }}>{open ? '▲' : '▼'}</span>
      </button>

      {/* Activity items */}
      {open && (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
          {topic.activities.map((act, i) => (
            <li key={i} className="activity-item">
              <span style={{ fontSize: '20px', lineHeight: 1, flexShrink: 0 }}>{TYPE_ICON[act.type] || '📄'}</span>
              <div style={{ flex: 1 }}>
                {act.type === 'assign' ? (
                  <Link
                    to={act.assignmentId
                      ? `/assignment/${act.assignmentId}`
                      : `/assignment/by-name/${courseId}?title=${encodeURIComponent(act.name)}`}
                    style={{ color: '#1177d1', fontSize: '13px' }} className="hover:underline">
                    {act.name}
                  </Link>
                ) : (
                  <a href={act.href} style={{ color: '#1177d1', fontSize: '13px' }} className="hover:underline">
                    {act.name}
                  </a>
                )}
              </div>
              <span style={{ fontSize: '11px', color: '#aaa', flexShrink: 0 }}>
                {TYPE_LABEL[act.type] || act.type}
              </span>
            </li>
          ))}
          {topic.activities.length === 0 && (
            <li style={{ padding: '10px 14px', fontSize: '13px', color: '#aaa' }}>No activities yet.</li>
          )}
        </ul>
      )}
    </div>
  );
}

export default function Course() {
  const { id } = useParams();
  const [course,  setCourse]  = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/courses/${id}`)
      .then(r => setCourse(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Layout><p style={{ fontSize: '13px', color: '#888', padding: '20px 0' }}>Loading…</p></Layout>;
  if (!course) return <Layout><p style={{ color: '#c0392b', padding: '20px 0' }}>Course not found.</p></Layout>;

  return (
    <Layout>
      <Breadcrumb links={[
        { label: 'Home',    href: '/' },
        { label: 'Courses', href: '/courses' },
        { label: course.category?.name || 'Category', href: course.category ? `/category/${course.category._id}` : '/courses' },
        { label: course.title }
      ]} />

      {/* Course header banner */}
      <div style={{
        background: course.color || '#1e4f8a',
        borderRadius: '4px', padding: '18px 22px',
        marginBottom: '16px', color: '#fff',
      }}>
        <div style={{
          display: 'inline-block', background: 'rgba(0,0,0,.3)',
          fontSize: '11px', fontFamily: 'monospace', padding: '2px 8px',
          borderRadius: '2px', marginBottom: '8px',
        }}>
          {course.code}
        </div>
        <h1 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 6px', color: '#fff' }}>
          {course.title}
        </h1>
        <p style={{ margin: 0, fontSize: '13px', opacity: .85 }}>
          👤 {course.instructor}
          {course.category && <> &nbsp;·&nbsp; 📂 {course.category.name}</>}
        </p>
      </div>

      {/* Topics */}
      {course.topics?.length > 0 ? (
        <div className="moodle-block">
          <div className="moodle-block-header">Course content</div>
          <div className="moodle-block-body" style={{ padding: '12px' }}>
            {course.topics.map((topic, i) => (
              <TopicSection key={i} topic={topic} courseId={course._id} />
            ))}
          </div>
        </div>
      ) : (
        <div className="moodle-block">
          <div className="moodle-block-body">
            <p style={{ fontSize: '13px', color: '#aaa', margin: 0 }}>No content available for this course yet.</p>
          </div>
        </div>
      )}
    </Layout>
  );
}
