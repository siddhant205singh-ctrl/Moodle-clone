import { useState } from 'react';
import Topbar from './Topbar';
import Header from './Header';
import Footer from './Footer';
import Drawer from './Drawer';
import Sidebar from './Sidebar';

const SIDEBAR_W = 240; // px — must match Sidebar.jsx width

export default function Layout({ children, fullWidthSlot }) {
  const [drawerOpen,  setDrawerOpen]  = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggle = () => setSidebarOpen(o => !o);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f4f4f4' }}>

      {/* ── Topbar — full width, never shifts ── */}
      <Topbar onSidebarToggle={toggle} sidebarOpen={sidebarOpen} />

      {/* ── Body row: sidebar + content side by side ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Sidebar panel — collapses to 0 when closed */}
        <div style={{
          width: sidebarOpen ? `${SIDEBAR_W}px` : '0',
          flexShrink: 0,
          overflow: 'hidden',
          transition: 'width .28s ease',
          position: 'relative',
          zIndex: 200,
        }}>
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Right content — fills all remaining space */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
          <Header onMenuToggle={() => setDrawerOpen(true)} />
          <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
          <main style={{ flex: 1 }}>
            {fullWidthSlot}
            <div className="max-w-[1180px] mx-auto px-3 py-4 w-full">
              {children}
            </div>
          </main>
          <Footer />
        </div>

      </div>
    </div>
  );
}
