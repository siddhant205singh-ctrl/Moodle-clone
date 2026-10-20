import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

/* ─── Mini Calendar ─── */
const MONTH_NAMES = ['January','February','March','April','May','June','July',
  'August','September','October','November','December'];
const DAY_NAMES_SHORT = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

function MiniCalendar({ events }) {
  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // Mon=0
  const daysInMonth  = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const eventDays = new Set(
    (events || []).filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() === month;
    }).map(e => new Date(e.date).getDate())
  );

  const isToday = (d) =>
    d && d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const prev = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const next = () => { if (month === 11) { setMonth(0);  setYear(y => y + 1); } else setMonth(m => m + 1); };

  return (
    <div style={{ fontSize: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <button onClick={prev} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', color: '#555' }}>«</button>
        <span style={{ fontWeight: 600, color: '#333', fontSize: '13px' }}>{MONTH_NAMES[month]} {year}</span>
        <button onClick={next} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', color: '#555' }}>»</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '2px' }}>
        {DAY_NAMES_SHORT.map(d => (
          <div key={d} style={{ textAlign: 'center', fontWeight: 700, color: '#888', padding: '2px 0', fontSize: '11px' }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px' }}>
        {cells.map((day, i) => (
          <div key={i} style={{
            textAlign: 'center', padding: '4px 1px', borderRadius: '3px', fontSize: '12px',
            background: isToday(day) ? '#49a52b' : eventDays.has(day) ? '#fde3c8' : 'transparent',
            color: isToday(day) ? '#fff' : eventDays.has(day) ? '#e07b00' : day ? '#333' : 'transparent',
            fontWeight: isToday(day) || eventDays.has(day) ? 700 : 400,
            cursor: eventDays.has(day) ? 'pointer' : 'default',
          }}>
            {day || ''}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Card colour palette (matches Moodle default patterns) ─── */
const CARD_COLORS = ['#f0a500','#7b5ea7','#49a52b','#2980b9','#e84393','#2ec4b6','#e07b00','#c0392b'];

/* ─── Recently accessed course card (horizontal scroll) ─── */
function RecentCourseCard({ course, idx }) {
  const bg = course.color || CARD_COLORS[idx % CARD_COLORS.length];
  return (
    <Link to={`/course/${course.slug}`} style={{
      textDecoration: 'none', color: 'inherit', display: 'block',
      border: '1px solid #dee2e6', borderRadius: '4px', overflow: 'hidden', background: '#fff',
      minWidth: '270px', maxWidth: '270px', flexShrink: 0,
      boxShadow: '0 1px 3px rgba(0,0,0,.07)',
    }}>
      <div style={{ height: '110px', background: bg, position: 'relative' }}>
        {course.image && <img src={course.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
      </div>
      <div style={{ padding: '10px 12px' }}>
        <div style={{ fontSize: '12px', color: '#888', marginBottom: '2px', overflow: 'hidden',
          textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {course.instructor}
        </div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#333', lineHeight: 1.4,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {course.title}
        </div>
      </div>
    </Link>
  );
}

/* ─── Course overview card (grid) ─── */
function DashCourseCard({ course, idx }) {
  const bg = course.color || CARD_COLORS[idx % CARD_COLORS.length];
  const progress = course.progress ?? 0;
  return (
    <Link to={`/course/${course.slug}`} style={{
      textDecoration: 'none', color: 'inherit', display: 'block',
      border: '1px solid #dee2e6', borderRadius: '4px', overflow: 'hidden', background: '#fff',
      boxShadow: '0 1px 3px rgba(0,0,0,.07)',
    }}>
      {/* thumbnail */}
      <div style={{ height: '120px', background: bg, position: 'relative' }}>
        {course.image && <img src={course.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        <button
          onClick={e => e.preventDefault()}
          style={{ position: 'absolute', top: '6px', right: '8px', background: 'none', border: 'none',
            color: '#fff', fontSize: '18px', cursor: 'pointer', lineHeight: 1, opacity: 0.9 }}>
          ⋯
        </button>
      </div>
      {/* body */}
      <div style={{ padding: '10px 12px' }}>
        <div style={{ fontSize: '12px', color: '#888', marginBottom: '2px', overflow: 'hidden',
          textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {course.instructor}
        </div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#333', lineHeight: 1.4, marginBottom: '8px',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {course.title}
        </div>
        {/* progress bar */}
        <div style={{ background: '#e9ecef', borderRadius: '2px', height: '4px', marginBottom: '4px' }}>
          <div style={{ width: `${progress}%`, background: '#ff6600', height: '4px', borderRadius: '2px', transition: 'width .4s' }} />
        </div>
        <div style={{ fontSize: '11px', color: '#888' }}>{progress}% complete</div>
      </div>
    </Link>
  );
}

/* ─── Dashboard ─── */
export default function Dashboard() {
  const { user: authUser } = useAuth();
  const [user,    setUser]    = useState(authUser);
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    Promise.all([api.get('/users/me'), api.get('/calendar')])
      .then(([uRes, eRes]) => { setUser(uRes.data); setEvents(eRes.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const courses        = user?.enrolledCourses || [];
  const recentCourses  = courses.slice(0, 6);
  const upcomingEvents = events.slice(0, 5);

  const scrollLeft  = () => scrollRef.current?.scrollBy({ left: -290, behavior: 'smooth' });
  const scrollRight = () => scrollRef.current?.scrollBy({ left:  290, behavior: 'smooth' });

  /* block wrapper helpers */
  const Block = ({ title, children, extra }) => (
    <div style={{ background: '#fff', border: '1px solid #dee2e6', borderRadius: '4px',
      marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#ff6600' }}>{title}</h3>
        {extra}
      </div>
      <div style={{ padding: '14px 16px' }}>{children}</div>
    </div>
  );

  return (
    <Layout>
      {/* Customise this page */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
        <button style={{ border: '1px solid #ccc', background: '#fff', borderRadius: '4px',
          padding: '5px 14px', fontSize: '13px', cursor: 'pointer', color: '#333' }}>
          Customise this page
        </button>
      </div>

      {loading ? (
        <p style={{ fontSize: '13px', color: '#888', padding: '20px 0' }}>Loading…</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '16px', alignItems: 'start' }}
          className="max-md:grid-cols-1">

          {/* ══ LEFT ══ */}
          <div>

            {/* Recently accessed courses */}
            <Block title="Recently accessed courses"
              extra={
                recentCourses.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={scrollLeft}  style={{ border: '1px solid #ccc', background: '#fff', borderRadius: '3px', width: '28px', height: '28px', cursor: 'pointer', fontSize: '14px' }}>‹</button>
                    <button onClick={scrollRight} style={{ border: '1px solid #ccc', background: '#fff', borderRadius: '3px', width: '28px', height: '28px', cursor: 'pointer', fontSize: '14px' }}>›</button>
                  </div>
                )
              }>
              {recentCourses.length > 0 ? (
                <div ref={scrollRef} style={{ display: 'flex', gap: '12px', overflowX: 'auto',
                  scrollbarWidth: 'none', msOverflowStyle: 'none', paddingBottom: '4px' }}>
                  {recentCourses.map((c, i) => <RecentCourseCard key={c._id} course={c} idx={i} />)}
                </div>
              ) : (
                <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>No recently accessed courses.</p>
              )}
            </Block>

            {/* Course overview */}
            <div style={{ background: '#fff', border: '1px solid #dee2e6', borderRadius: '4px',
              boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#ff6600' }}>Course overview</h3>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <select style={{ fontSize: '12px', border: '1px solid #ccc', borderRadius: '3px', padding: '3px 6px', cursor: 'pointer' }}>
                    <option>All (except removed from view)</option>
                    <option>In progress</option>
                    <option>Future</option>
                    <option>Past</option>
                  </select>
                  <select style={{ fontSize: '12px', border: '1px solid #ccc', borderRadius: '3px', padding: '3px 6px', cursor: 'pointer' }}>
                    <option>Course name</option>
                    <option>Last accessed</option>
                  </select>
                  <select style={{ fontSize: '12px', border: '1px solid #ccc', borderRadius: '3px', padding: '3px 6px', cursor: 'pointer' }}>
                    <option>Card</option>
                    <option>List</option>
                  </select>
                </div>
              </div>
              <div style={{ padding: '16px' }}>
                {courses.length > 0 ? (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
                      {courses.map((c, i) => <DashCourseCard key={c._id} course={c} idx={i} />)}
                    </div>
                    <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#555' }}>
                      <span>Show</span>
                      <select style={{ border: '1px solid #ccc', borderRadius: '3px', padding: '3px 8px', fontSize: '13px', cursor: 'pointer' }}>
                        <option>All</option>
                        <option>10</option>
                        <option>20</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>You are not enrolled in any courses.</p>
                )}
              </div>
            </div>

          </div>

          {/* ══ RIGHT SIDEBAR ══ */}
          <div>

            {/* Timeline */}
            <Block title="Timeline"
              extra={
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button style={{ border: '1px solid #ccc', background: '#fff', borderRadius: '3px',
                    padding: '2px 8px', fontSize: '12px', cursor: 'pointer' }}>🕐 ▾</button>
                  <button style={{ border: '1px solid #ccc', background: '#fff', borderRadius: '3px',
                    padding: '2px 8px', fontSize: '12px', cursor: 'pointer' }}>↕ ▾</button>
                </div>
              }>
              {upcomingEvents.length > 0 ? (
                <>
                  {upcomingEvents.map(e => {
                    const d = new Date(e.date);
                    const dateStr = d.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
                    const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
                    return (
                      <div key={e._id} style={{ marginBottom: '14px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#ff6600', marginBottom: '5px' }}>{dateStr}</div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                          <span style={{ fontSize: '16px', marginTop: '1px', flexShrink: 0 }}>📋</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#333' }}>
                              &ldquo;{e.title}&rdquo;
                            </div>
                            {e.course && (
                              <div style={{ fontSize: '11px', color: '#888', marginBottom: '3px' }}>
                                {e.course.title}
                              </div>
                            )}
                            <Link to={e.course ? `/course/${e.course.slug}` : '#'}
                              style={{ fontSize: '12px', color: '#1177d1', textDecoration: 'none' }}
                              className="hover:underline">
                              Add submission
                            </Link>
                          </div>
                          <span style={{ fontSize: '12px', color: '#555', whiteSpace: 'nowrap' }}>{timeStr}</span>
                        </div>
                      </div>
                    );
                  })}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#555',
                    borderTop: '1px solid #f0f0f0', paddingTop: '8px', marginTop: '4px' }}>
                    <span>Show</span>
                    <select style={{ border: '1px solid #ccc', borderRadius: '3px', padding: '2px 6px', fontSize: '12px', cursor: 'pointer' }}>
                      <option>5</option>
                      <option>10</option>
                      <option>25</option>
                    </select>
                  </div>
                </>
              ) : (
                <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>No upcoming deadlines.</p>
              )}
            </Block>

            {/* Upcoming events */}
            <Block title="Upcoming events">
              {upcomingEvents.length > 0 ? (
                <>
                  {upcomingEvents.map(e => (
                    <div key={e._id} style={{ marginBottom: '10px' }}>
                      <div style={{ color: '#ff6600', fontWeight: 600, fontSize: '13px' }}>{e.title}</div>
                      <div style={{ color: '#888', fontSize: '12px' }}>
                        {new Date(e.date).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })},{' '}
                        {new Date(e.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </div>
                    </div>
                  ))}
                  <Link to="/calendar" style={{ fontSize: '13px', color: '#ff6600', textDecoration: 'none' }}
                    className="hover:underline">Go to calendar...</Link>
                </>
              ) : (
                <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>No upcoming events.</p>
              )}
            </Block>

            {/* Mini Calendar */}
            <div style={{ background: '#fff', border: '1px solid #dee2e6', borderRadius: '4px',
              marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,.06)', padding: '12px 14px' }}>
              <MiniCalendar events={events} />
            </div>

            {/* Private files */}
            <Block title="Private files">
              <p style={{ fontSize: '13px', color: '#555', margin: '0 0 8px' }}>No files available</p>
              <a href="#" style={{ fontSize: '13px', color: '#ff6600', textDecoration: 'none' }}
                className="hover:underline">Manage private files...</a>
            </Block>

            {/* Online users */}
            <Block title="Online users">
              <p style={{ fontSize: '12px', color: '#888', margin: '0 0 8px' }}>
                {user ? '1 online user (last 5 minutes)' : '0 online users (last 5 minutes)'}
              </p>
              {user && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#333' }}>
                  <span>👤</span>
                  <span style={{ fontWeight: 500 }}>{user.name}</span>
                  <span style={{ fontSize: '12px', color: '#aaa', marginLeft: 'auto' }}>👁</span>
                </div>
              )}
            </Block>

          </div>
        </div>
      )}
    </Layout>
  );
}
