import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Breadcrumb from '../components/Breadcrumb';
import CategoryTree from '../components/CategoryTree';

export default function Courses() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/search?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <Layout>
      <Breadcrumb links={[{ label: 'Home', href: '/' }, { label: 'Course categories' }]} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '16px', alignItems: 'start' }}
        className="max-md:grid-cols-1">

        {/* Left — category tree */}
        <div className="moodle-block">
          <div className="moodle-block-header">
            <span>Course categories</span>
          </div>
          <div className="moodle-block-body" style={{ padding: '8px 10px' }}>
            <CategoryTree />
          </div>
        </div>

        {/* Right — search */}
        <div className="moodle-block">
          <div className="moodle-block-header">Search courses</div>
          <div className="moodle-block-body">
            <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Enter search term…"
                className="moodle-input"
              />
              <button type="submit" className="btn-primary">Go</button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
