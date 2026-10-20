import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import Breadcrumb from '../components/Breadcrumb';

export default function Profile() {
  const [user,    setUser]    = useState(null);
  const [editing, setEditing] = useState(false);
  const [form,    setForm]    = useState({});
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState('');

  useEffect(() => {
    api.get('/users/me').then(r => {
      setUser(r.data);
      setForm({ name: r.data.name, department: r.data.department });
    }).catch(console.error);
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg('');
    try {
      const res = await api.put('/users/me', form);
      setUser(res.data);
      setEditing(false);
      setMsg('Profile updated successfully.');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <Layout><p style={{ fontSize: '13px', color: '#888', padding: '20px 0' }}>Loading…</p></Layout>;

  return (
    <Layout>
      <Breadcrumb links={[{ label: 'Home', href: '/' }, { label: 'Dashboard', href: '/dashboard' }, { label: 'Profile' }]} />

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '16px', alignItems: 'start' }}
        className="max-md:grid-cols-1">

        {/* ── Left — avatar block ── */}
        <div className="moodle-block">
          <div className="moodle-block-header">User</div>
          <div className="moodle-block-body" style={{ textAlign: 'center' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: '#1e4f8a', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '32px', fontWeight: 700, margin: '0 auto 10px',
            }}>
              {user.name?.[0] || '?'}
            </div>
            <div style={{ fontWeight: 700, fontSize: '14px', color: '#333' }}>{user.name}</div>
            <div style={{ fontSize: '12px', color: '#888', textTransform: 'capitalize', marginTop: '2px' }}>{user.role}</div>
            <div style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }}>{user.department}</div>
          </div>
        </div>

        {/* ── Right — profile details ── */}
        <div className="moodle-block">
          <div className="moodle-block-header">
            <span>Profile</span>
            {!editing && (
              <button onClick={() => setEditing(true)} className="btn-primary"
                style={{ padding: '3px 10px', fontSize: '12px' }}>Edit</button>
            )}
          </div>
          <div className="moodle-block-body">
            {msg && (
              <div style={{ background: '#e8f5e9', border: '1px solid #a5d6a7', color: '#2e7d32', padding: '8px 12px', borderRadius: '3px', fontSize: '13px', marginBottom: '14px' }}>
                ✓ {msg}
              </div>
            )}

            {editing ? (
              <form onSubmit={handleSave}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '10px 0', color: '#888', width: '120px', verticalAlign: 'top', paddingTop: '12px' }}>Full name</td>
                      <td style={{ padding: '10px 0' }}>
                        <input type="text" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                          className="moodle-input" style={{ maxWidth: '320px' }} />
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '10px 0', color: '#888', verticalAlign: 'top', paddingTop: '12px' }}>Department</td>
                      <td style={{ padding: '10px 0' }}>
                        <input type="text" value={form.department || ''} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                          className="moodle-input" style={{ maxWidth: '320px' }} />
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div style={{ marginTop: '14px', display: 'flex', gap: '8px' }}>
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? 'Saving…' : 'Save changes'}
                  </button>
                  <button type="button" onClick={() => setEditing(false)}
                    style={{ background: '#eee', color: '#333', border: 'none', borderRadius: '3px', padding: '6px 14px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <tbody>
                  {[
                    ['Username',   user.username],
                    ['Full name',  user.name],
                    ['Role',       user.role],
                    ['Department', user.department],
                    ['ID / Roll',  user.studentId],
                  ].map(([k, v]) => (
                    <tr key={k} style={{ borderBottom: '1px solid #f5f5f5' }}>
                      <td style={{ padding: '9px 0', color: '#888', width: '120px' }}>{k}</td>
                      <td style={{ padding: '9px 0', color: '#333', textTransform: k === 'Role' ? 'capitalize' : 'none' }}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
