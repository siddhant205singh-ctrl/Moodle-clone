import { Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import Layout from '../components/Layout';

export default function ForgotPassword() {
  return (
    <Layout>
      <Breadcrumb links={[{ label: 'Home', href: '/' }, { label: 'Log in', href: '/login' }, { label: 'Forgotten password' }]} />

      <div style={{ maxWidth: '500px' }}>
        <div className="moodle-block">
          <div className="moodle-block-header">Forgotten password</div>
          <div className="moodle-block-body">
            <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.7, marginBottom: '16px' }}>
              To reset your password, submit your username or your email address below.
              If we can find you in the database, an email will be sent to your email address,
              with instructions on how to get access again.
            </p>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '4px' }}>
                Search by username
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" placeholder="Username" className="moodle-input" style={{ flex: 1 }} />
                <button className="btn-primary">Search</button>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: '#888', margin: '16px 0 8px' }}>— OR —</p>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '4px' }}>
                Search by email address
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="email" placeholder="Email address" className="moodle-input" style={{ flex: 1 }} />
                <button className="btn-primary">Search</button>
              </div>
            </div>

            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f0f0f0' }}>
              <Link to="/login" style={{ color: '#1177d1', fontSize: '13px' }}>← Back to login page</Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
