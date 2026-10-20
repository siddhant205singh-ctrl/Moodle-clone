import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import Breadcrumb from '../components/Breadcrumb';

const LETTER_STYLE = {
  O:   { background: '#1a7f37', color: '#fff' },
  'A+':{ background: '#2980b9', color: '#fff' },
  A:   { background: '#2980b9', color: '#fff' },
  'B+':{ background: '#e07b00', color: '#fff' },
  B:   { background: '#e07b00', color: '#fff' },
  C:   { background: '#888',    color: '#fff' },
  F:   { background: '#c0392b', color: '#fff' },
  NA:  { background: '#eee',    color: '#888' },
};

export default function Grades() {
  const [grades,  setGrades]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/grades/me').then(r => setGrades(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <Breadcrumb links={[{ label: 'Home', href: '/' }, { label: 'Dashboard', href: '/dashboard' }, { label: 'Grades' }]} />

      <div className="moodle-block">
        <div className="moodle-block-header">Grade report</div>
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <p style={{ fontSize: '13px', color: '#888', padding: '16px 14px', margin: 0 }}>Loading…</p>
          ) : grades.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#888', padding: '16px 14px', margin: 0 }}>No grade records available.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f7f7f7', borderBottom: '2px solid #dee2e6' }}>
                  {['Course', 'Code', 'Semester', 'Score', 'Grade'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#444', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grades.map((g, i) => (
                  <tr key={g._id} style={{ borderBottom: '1px solid #f0f0f0', background: i % 2 === 0 ? '#fff' : '#fbfbfb' }}>
                    <td style={{ padding: '9px 14px' }}>
                      <Link to={`/course/${g.course?.slug}`} style={{ color: '#1177d1' }}>
                        {g.course?.title}
                      </Link>
                    </td>
                    <td style={{ padding: '9px 14px', fontFamily: 'monospace', color: '#666' }}>{g.course?.code}</td>
                    <td style={{ padding: '9px 14px', color: '#666' }}>{g.semester}</td>
                    <td style={{ padding: '9px 14px', fontWeight: 600, color: '#333' }}>{g.score}/100</td>
                    <td style={{ padding: '9px 14px' }}>
                      <span style={{
                        ...(LETTER_STYLE[g.grade] || LETTER_STYLE.NA),
                        padding: '2px 10px', borderRadius: '3px', fontSize: '12px', fontWeight: 700,
                      }}>
                        {g.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
}
