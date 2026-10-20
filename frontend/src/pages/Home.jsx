import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import CategoryTree from '../components/CategoryTree';

const SLIDES = [
  {
    img: '/slide1.png',
    
  },
  {
    img: '/slide2.png',
    
  },
  {
    img: '/slide3.png',
    
  },
  {
    img: '/slide4.png',
    
  },
  {
    img: '/slide5.png',
    
  },
  {
    img: '/slide6.png',
    
  },
  {
    img: '/slide7.png',
    
  },
];

export default function Home() {
  const [slide,  setSlide]  = useState(0);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const next = useCallback(() => setSlide(s => (s + 1) % SLIDES.length), []);
  const prev = () => setSlide(s => (s - 1 + SLIDES.length) % SLIDES.length);

  useEffect(() => {
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/search?q=${encodeURIComponent(search.trim())}`);
  };

  const carousel = (
    /* ── Full-width carousel — no max-width constraint ── */
    <div style={{ position: 'relative', overflow: 'hidden', width: '100%' }}>
      <div style={{ position: 'relative', height: '520px' }}>
        {SLIDES.map((s, i) => (
          <div key={i} style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${s.img})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
            opacity: i === slide ? 1 : 0,
            transition: 'opacity 0.8s ease',
            pointerEvents: i === slide ? 'auto' : 'none',
          }}>
            {/* Dark gradient overlay */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,.05) 0%, rgba(0,0,0,.55) 100%)' }} />
            {/* Caption */}
            {(s.title || s.sub) && (
              <div style={{ position: 'absolute', bottom: '70px', left: 0, right: 0, textAlign: 'center', color: '#fff', padding: '0 80px' }}>
                {s.title && <h2 style={{ fontSize: '30px', fontWeight: 700, margin: '0 0 10px', textShadow: '0 2px 6px rgba(0,0,0,.6)', lineHeight: 1.2 }}>{s.title}</h2>}
                {s.sub   && <p  style={{ fontSize: '16px', margin: 0, opacity: 0.92, textShadow: '0 1px 3px rgba(0,0,0,.5)' }}>{s.sub}</p>}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Prev / Next arrows */}
      <button onClick={prev} style={{
        position: 'absolute', top: '50%', left: '20px', transform: 'translateY(-50%)',
        background: 'rgba(0,0,0,.4)', color: '#fff', border: 'none',
        width: '44px', height: '44px', borderRadius: '50%',
        fontSize: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background .2s',
      }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,.7)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,.4)'}
      >‹</button>
      <button onClick={next} style={{
        position: 'absolute', top: '50%', right: '20px', transform: 'translateY(-50%)',
        background: 'rgba(0,0,0,.4)', color: '#fff', border: 'none',
        width: '44px', height: '44px', borderRadius: '50%',
        fontSize: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background .2s',
      }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,.7)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,.4)'}
      >›</button>

      {/* Dot indicators */}
      {/* <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px' }}>
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => setSlide(i)} style={{
            width: i === slide ? '28px' : '10px', height: '10px',
            borderRadius: '5px',
            border: '2px solid rgba(255,255,255,.8)',
            background: i === slide ? '#fff' : 'transparent',
            cursor: 'pointer', padding: 0,
            transition: 'width .3s, background .3s',
          }} />
        ))}
      </div> */}
    </div>
  );

  return (
    <Layout fullWidthSlot={carousel}>

      {/* ── Site announcements ── */}
      <div id="site-news-forum" style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#f37c1b', marginBottom: '12px', borderBottom: '1px solid #dee2e6', paddingBottom: '8px' }}>
          Site announcements
        </h2>
        <div style={{ fontSize: '13px', color: '#6c757d', fontStyle: 'italic', padding: '8px 0' }}>
          (There are no discussion topics yet in this forum)
        </div>
      </div>

      {/* ── Search courses ── */}
      <div style={{ textAlign: 'left', margin: '16px 0', padding: '12px', background: '#f8f9fa', borderRadius: '4px' , border: '1px solid #968c8c' }}>
        <form onSubmit={handleSearch} style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
          <label htmlFor="shortsearchbox" style={{ fontSize: '13px', marginRight: '6px', color: '#555' }}>Search courses</label>
          <input
            id="shortsearchbox"
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            size={25}
            className="moodle-input"
            style={{ width: '560px' }}
          />
          <button type="submit" className="btn-secondary" style={{ padding: '5px 14px', fontSize: '13px' , border: '1px solid #8a8383'}}>Go</button>
        </form>
      </div>
<br></br>
      {/* ── Course categories ── */}
      <div id="frontpage-category-names" style={{ marginTop: '16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#ec6d32', marginBottom: '12px', borderBottom: '1px solid #dee2e6', paddingBottom: '8px' }}>
          Course categories
        </h2>
        <div style={{ padding: '4px 0' }}>
          <CategoryTree />
        </div>
      </div>

    </Layout>
  );
}
