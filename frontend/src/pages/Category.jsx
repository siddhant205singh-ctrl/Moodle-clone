import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import Breadcrumb from '../components/Breadcrumb';
import CourseCard from '../components/CourseCard';

const PAGE_SIZE = 4;

export default function Category() {
  const { id }  = useParams();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    api.get(`/categories/${id}`)
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Layout><p style={{ fontSize: '13px', color: '#888', padding: '20px 0' }}>Loading…</p></Layout>;
  if (!data)   return <Layout><p style={{ color: '#c0392b', padding: '20px 0', fontSize: '13px' }}>Category not found.</p></Layout>;

  const allCourses  = data.courses || [];
  const totalPages  = Math.ceil(allCourses.length / PAGE_SIZE);
  const paginated   = allCourses.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Layout>
      <Breadcrumb links={[
        { label: 'Home',    href: '/' },
        { label: 'Courses', href: '/courses' },
        { label: data.name }
      ]} />

      {/* Page heading */}
      <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#333', marginBottom: '16px' }}>{data.name}</h1>

      {/* Subcategories */}
      {data.children?.length > 0 && (
        <div className="moodle-block">
          <div className="moodle-block-header">Sub-categories</div>
          <div className="moodle-block-body" style={{ padding: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
              {data.children.map(child => (
                <Link key={child._id} to={`/category/${child._id}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    border: '1px solid #dee2e6', borderRadius: '3px',
                    padding: '8px 12px', fontSize: '13px', color: '#1177d1',
                    background: '#fff', textDecoration: 'none',
                  }}
                  className="hover:bg-[#f7f7f7]">
                  <span style={{ color: '#888' }}>📂</span>
                  {child.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Courses */}
      {allCourses.length > 0 ? (
        <div className="moodle-block">
          <div className="moodle-block-header">
            <span>Courses in this category</span>
            <span style={{ fontSize: '12px', color: '#888', fontWeight: 400 }}>{allCourses.length} course{allCourses.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="moodle-block-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
              {paginated.map(course => <CourseCard key={course._id} course={course} />)}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', paddingTop: '8px', borderTop: '1px solid #f0f0f0' }}>
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                  className="btn-primary" style={{ opacity: page === 1 ? 0.4 : 1, padding: '4px 12px', fontSize: '12px' }}>
                  ‹ Prev
                </button>
                <span style={{ fontSize: '12px', color: '#666' }}>Page {page} of {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                  className="btn-primary" style={{ opacity: page === totalPages ? 0.4 : 1, padding: '4px 12px', fontSize: '12px' }}>
                  Next ›
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        data.children?.length === 0 && (
          <p style={{ fontSize: '13px', color: '#888' }}>No courses in this category yet.</p>
        )
      )}
    </Layout>
  );
}
