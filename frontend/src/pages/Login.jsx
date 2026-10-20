import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

export default function Login() {
  const { login, token } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    if (token) navigate('/dashboard', { replace: true });
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username || !password) { setError('Please enter your username and password.'); return; }
    setLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid login, please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>

          {/* Breadcrumb */}
          <div style={{ fontSize: '12px', color: '#666',width:'200px', marginBottom: '16px', display: 'flex', gap: '6px', alignItems: 'center' }}>
            <a href="/" style={{ color: '#1177d1' }}>Home</a>
            <span style={{ color: '#bbb' }}>›</span>
            <span>Log in to the site</span>
          </div>

          <div style={{ border: '1px solid #dee2e6', borderRadius: '4px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,.1)', background: '#fff' }}>

            {/* ── Logo at top of card ── */}
            <div style={{ textAlign: 'center', padding: '40x 40px 40px 40px' }}>
              <img src="/logo.png" alt="KIET" style={{ width: '700px', height: '200px', maxWidth: '100%', objectFit: 'contain', border:'1px solid black' }} />
            </div>

            {/* ── Login form ── */}
            <div style={{ padding: '35px ' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#333', marginBottom: '20px' }}>
               
              </h2>

              {error && (
                <div style={{ background: '#fdf0f0', border: '1px solid #f5c0c0', color: '#c0392b', padding: '8px 12px', borderRadius: '3px', fontSize: '13px', marginBottom: '14px' }}>
                  ⚠ {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '4px' }}>
                    Username
                  </label>
                  <input
                    type="text" value={username} onChange={e => setUsername(e.target.value)}
                    placeholder="Username"
                    style={{ width:'280px',height:'40px', maxwidth:'100%'}}
                    className="moodle-input"
                    autoFocus
                  />
                </div>
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '4px' ,  }}>
                    Password
                  </label>
                  <input
                    type="password" value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Password"
                    className="moodle-input"
                    style = {{width:'280px', height:'40px'}}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#555', cursor: 'pointer' }}>
                    <input type="checkbox" style={{ cursor: 'pointer' }} />
                    Remember username
                  </label>
                </div>

                <button type="submit" disabled={loading}
                  className="btn-primary"
                  style={{ width: '50%', padding: '9px', fontSize: '14px', fontWeight: 600, opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Logging in…' : 'Log in'}
                </button>
              </form>

              <div style={{ marginTop: '14px', textAlign: 'left', fontSize: '15px' ,
                position:'absolute', top:'470px', left:'780px', width:'200px'
               }}>
                <Link to="/forgot" style={{ color: '#ec7d22' }}>Forgotten your username or password?</Link>
              </div>

              <div style={{ marginTop: '20px', padding: '12px', background: '#ffffff', border: '0px solid #eee', borderRadius: '3px', fontSize: '15px', color: '#777',
                position:'absolute' ,top :'520px', left:'780px ',width: '250px'
               }}>
             <h2> Cookies must be enabled in your browser</h2>
              </div>
            </div>
          </div>
      </div>
    </Layout>
  );
}
