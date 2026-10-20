import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import Breadcrumb from '../components/Breadcrumb';

const CATEGORY_COLOR = {
  'Computer Science': '#1e4f8a',
  'AI/ML':            '#7b2d8e',
  'Mathematics':      '#0b6e4f',
  'Web':              '#cc4444',
};

export default function EBook() {
  const [books,   setBooks]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/ebooks').then(r => setBooks(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <Breadcrumb links={[{ label: 'Home', href: '/' }, { label: 'e-Book Bank' }]} />

      <div className="moodle-block">
        <div className="moodle-block-header">
          <span>Central e-Book Bank</span>
          <span style={{ fontSize: '12px', color: '#888', fontWeight: 400 }}>
            {!loading && `${books.length} books`}
          </span>
        </div>
        <div className="moodle-block-body">
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
            Digital library resources available to KIET students and faculty.
          </p>

          {loading ? (
            <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>Loading…</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
              {books.map(book => (
                <div key={book._id} style={{
                  border: '1px solid #dee2e6', borderRadius: '4px',
                  overflow: 'hidden', background: '#fff', display: 'flex', flexDirection: 'column',
                }}>
                  {/* Colored spine */}
                  <div style={{
                    background: CATEGORY_COLOR[book.category] || '#444',
                    height: '6px', flexShrink: 0,
                  }} />
                  <div style={{ padding: '12px', flex: 1, display: 'flex', gap: '10px' }}>
                    {/* Book icon */}
                    <div style={{
                      width: '36px', height: '48px', flexShrink: 0,
                      background: CATEGORY_COLOR[book.category] || '#444',
                      borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '20px',
                    }}>📚</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '13px', color: '#333', lineHeight: 1.4, marginBottom: '4px' }}>
                        {book.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>{book.author}</div>
                      <div style={{ fontSize: '11px', color: '#aaa' }}>
                        {book.category}
                        {book.isbn && <> &nbsp;·&nbsp; ISBN: {book.isbn}</>}
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: '0 12px 12px' }}>
                    <a href={book.url} style={{
                      display: 'block', textAlign: 'center', padding: '5px',
                      background: '#1177d1', color: '#fff', borderRadius: '3px',
                      fontSize: '12px', textDecoration: 'none',
                    }}
                      className="hover:bg-[#0f5fa8]">
                      Access Book
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
