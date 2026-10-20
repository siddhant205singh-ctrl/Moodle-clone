import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import Breadcrumb from '../components/Breadcrumb';

const YEAR = 2026, MONTH = 9; // October 2026 (0-indexed)
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_NAMES   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const TYPE_COLOR = {
  assignment: '#e07b00', quiz: '#7b5ea7',
  exam: '#c0392b', lecture: '#2980b9', other: '#888',
};

function buildGrid(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/calendar').then(r => setEvents(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const cells = buildGrid(YEAR, MONTH);
  const eventDays = new Set(
    events.filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === YEAR && d.getMonth() === MONTH;
    }).map(e => new Date(e.date).getDate())
  );

  return (
    <Layout>
      <Breadcrumb links={[{ label: 'Home', href: '/' }, { label: 'Calendar' }]} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'start' }}
        className="max-md:grid-cols-1">

        {/* ── Month grid ── */}
        <div className="moodle-block">
          <div className="moodle-block-header">{MONTH_NAMES[MONTH]} {YEAR}</div>
          <div className="moodle-block-body" style={{ padding: '12px' }}>
            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
              {DAY_NAMES.map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#888', padding: '4px 0' }}>{d}</div>
              ))}
            </div>
            {/* Date cells */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
              {cells.map((day, i) => (
                <div key={i} style={{
                  textAlign: 'center', padding: '6px 2px',
                  borderRadius: '3px', fontSize: '13px',
                  background: day && eventDays.has(day) ? '#ff6600' : 'transparent',
                  color: day && eventDays.has(day) ? '#fff' : day ? '#333' : 'transparent',
                  fontWeight: day && eventDays.has(day) ? 700 : 400,
                  cursor: day && eventDays.has(day) ? 'pointer' : 'default',
                }}>
                  {day || ''}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Event list ── */}
        <div className="moodle-block">
          <div className="moodle-block-header">Upcoming events</div>
          <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
            {loading ? (
              <p style={{ fontSize: '13px', color: '#888', padding: '14px', margin: 0 }}>Loading…</p>
            ) : events.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#888', padding: '14px', margin: 0 }}>No upcoming events.</p>
            ) : (
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {events.map(e => (
                  <li key={e._id} style={{ padding: '10px 14px', borderBottom: '1px solid #f0f0f0', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{
                      background: TYPE_COLOR[e.type] || '#888',
                      color: '#fff', borderRadius: '3px',
                      padding: '3px 7px', fontSize: '11px', fontWeight: 700,
                      whiteSpace: 'nowrap', flexShrink: 0, marginTop: '1px',
                      textTransform: 'uppercase', letterSpacing: '0.03em',
                    }}>
                      {e.type}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#333' }}>{e.title}</div>
                      {e.course && <div style={{ fontSize: '12px', color: '#888' }}>{e.course.title}</div>}
                      <div style={{ fontSize: '11px', color: '#aaa', marginTop: '2px' }}>
                        {new Date(e.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
