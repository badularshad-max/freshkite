import { useState } from 'react';
import { supabase } from '../lib/supabase.js';
import HomeSettings from '../components/HomeSettings.jsx';
import ContactSettings from '../components/ContactSettings.jsx';
import styles from './Admin.module.css';

const TABS = [
  { id: 'home', label: 'Home Page' },
  { id: 'contact', label: 'Contact Page' },
];

export default function Admin({ session }) {
  const [activeTab, setActiveTab] = useState('home');

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <span className={styles.brandName}>FRESHKITE</span>
            <span className={styles.brandSep}>/</span>
            <span className={styles.brandSub}>Content Admin</span>
          </div>
          <div className={styles.headerRight}>
            <span className={styles.userEmail}>{session.user.email}</span>
            <button className={styles.signOutBtn} onClick={handleSignOut}>Sign out</button>
          </div>
        </div>
      </header>

      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <nav className={styles.nav}>
            <p className={styles.navLabel}>Pages</p>
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`${styles.navItem} ${activeTab === tab.id ? styles.navItemActive : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className={styles.navIcon}>
                  {tab.id === 'home' ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z" />
                    </svg>
                  )}
                </span>
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className={styles.main}>
          {activeTab === 'home' && <HomeSettings />}
          {activeTab === 'contact' && <ContactSettings />}
        </main>
      </div>
    </div>
  );
}
