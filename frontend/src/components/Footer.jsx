export default function Footer() {
  return (
    <footer style={{ background: '#2b2b2b', color: '#ccc' }}>

      {/* ── Main footer ── */}
      <div style={{ padding: '30px 0' }}>
        <div className="max-w-[1180px] mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

            {/* Col 1 — Logo + About (5/12) */}
            <div className="md:col-span-5">
              <div style={{ marginBottom: '14px' }}>
                <a href="http://lms.kiet.edu/moodle/" target="_blank" rel="noreferrer">
                  <img
                    src="//lms.kiet.edu/moodle/pluginfile.php/1/theme_academi/logo/1789020033/unnamed%20%282%29.png"
                    width="100" height="100" alt="KIET LMS"
                    style={{ borderRadius: '4px' }}
                  />
                </a>
              </div>
              <p style={{ fontSize: '13px', color: '#aaa', lineHeight: 1.7, margin: 0 }}>
                A&nbsp;learning management system (LMS) is a&nbsp;<strong>software&nbsp;Application</strong>&nbsp;
                which is used&nbsp;for&nbsp;administration, documentation, reporting and delivery of&nbsp;
                <strong>educational&nbsp;</strong>courses or training programs. LMS in the college&nbsp;help the&nbsp;
                Faculty Member to&nbsp;deliver material to the students, administer tests and give assignments
                and track student progress.
              </p>
            </div>

            {/* Col 2 — Info links (3/12) */}
            <div className="md:col-span-3">
              <h2 style={{ color: '#fff', fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>Info</h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  ['Central e-Book Bank', 'http://lms.kiet.edu/moodle/course/view.php?id=2684'],
                  ['KIET Website',        'https://www.kiet.edu/#/Home'],
                  ['AKTU Website',        'https://aktu.ac.in/'],
                  ['AICTE Website',       'https://www.aicte-india.org'],
                ].map(([label, href]) => (
                  <li key={label}>
                    <a href={href} target="_blank" rel="noreferrer"
                      style={{ color: '#aaa', fontSize: '13px', textDecoration: 'none' }}
                      className="hover:text-[#ff6600]">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3 — Contact + Social (4/12) */}
            <div className="md:col-span-4">
              <h2 style={{ color: '#fff', fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>Contact us</h2>
              <p style={{ fontSize: '13px', color: '#aaa', lineHeight: 1.8, marginBottom: '16px' }}>
                KIET GROUP OF INSTITUTIONS Delhi-NCR,<br />
                Meerut Road (NH-58) Ghaziabad-201206<br />
                📞 Phone : 8744097774<br />
                ✉ E-mail :{' '}
                <a href="mailto:itsupport@kiet.edu"
                  style={{ color: '#ff6600', textDecoration: 'none' }}>
                  itsupport@kiet.edu
                </a>
              </p>

              <h6 style={{ color: '#fff', fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>Follow us</h6>
              <div style={{ display: 'flex', gap: '8px' }}>
                <a href="https://www.facebook.com/kiet.edu/?ref=br_rs" target="_blank" rel="noreferrer"
                  style={{ background: '#3b5998', color: '#fff', padding: '5px 12px', borderRadius: '3px', fontSize: '12px', textDecoration: 'none' }}
                  className="hover:opacity-80">Facebook</a>
                <a href="https://www.youtube.com/channel/UC4rxBQyVV00oGX9-m2aqKYw" target="_blank" rel="noreferrer"
                  style={{ background: '#ff0000', color: '#fff', padding: '5px 12px', borderRadius: '3px', fontSize: '12px', textDecoration: 'none' }}
                  className="hover:opacity-80">YouTube</a>
                <a href="https://twitter.com/Kiet_edu?t=PbW5bz9b9mJba6EHgqiH9g&s=09" target="_blank" rel="noreferrer"
                  style={{ background: '#1da1f2', color: '#fff', padding: '5px 12px', borderRadius: '3px', fontSize: '12px', textDecoration: 'none' }}
                  className="hover:opacity-80">Twitter</a>
                <a href="https://www.instagram.com/accounts/login/" target="_blank" rel="noreferrer"
                  style={{ background: '#e1306c', color: '#fff', padding: '5px 12px', borderRadius: '3px', fontSize: '12px', textDecoration: 'none' }}
                  className="hover:opacity-80">Instagram</a>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div style={{ background: '#1a1a1a', padding: '12px', textAlign: 'center', fontSize: '13px', color: '#777' }}>
        <p style={{ margin: 0 }}>
          Copyright © 2023 - Developed by KIET. Powered by{' '}
          <a href="https://moodle.org" target="_blank" rel="noreferrer"
            style={{ color: '#ff6600', textDecoration: 'none' }}>Moodle</a>
        </p>
      </div>

    </footer>
  );
}
