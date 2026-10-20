import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import Breadcrumb from '../components/Breadcrumb';
import CourseCard from '../components/CourseCard';

export default function Search() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    api.get(`/courses/search?q=${encodeURIComponent(q)}`)
      .then(r => setResults(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <Layout>
      <Breadcrumb links={[{ label: 'Home', href: '/' }, { label: 'Courses', href: '/courses' }, { label: 'Search results' }]} />

      <div className="moodle-block">
        <div className="moodle-block-header">
          <span>Search results</span>
          {q && <span style={{ fontSize: '12px', color: '#888', fontWeight: 400 }}>for "{q}"</span>}
        </div>
        <div className="moodle-block-body">
          {!q && <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>Enter a search term in the URL (e.g. /search?q=data).</p>}
          {loading && <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>Searching…</p>}
          {!loading && q && results.length === 0 && (
            <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>No courses found matching "<strong>{q}</strong>".</p>
          )}
          {results.length > 0 && (
            <>
              <p style={{ fontSize: '12px', color: '#888', marginBottom: '14px' }}>
                {results.length} course{results.length !== 1 ? 's' : ''} found
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                {results.map(course => <CourseCard key={course._id} course={course} />)}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
