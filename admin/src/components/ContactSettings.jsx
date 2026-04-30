import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';
import styles from './Settings.module.css';

export default function ContactSettings() {
  const [recordId, setRecordId] = useState(null);
  const [emailPrimary, setEmailPrimary] = useState('');
  const [emailDirect, setEmailDirect] = useState('');
  const [phoneWhatsapp, setPhoneWhatsapp] = useState('');
  const [phoneWhatsappLink, setPhoneWhatsappLink] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from('contact_content')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        showToast('Failed to load contact content', 'error');
      } else if (data) {
        setRecordId(data.id);
        setEmailPrimary(data.email_primary);
        setEmailDirect(data.email_direct);
        setPhoneWhatsapp(data.phone_whatsapp);
        setPhoneWhatsappLink(data.phone_whatsapp_link);
        setLocation(data.location);
      }
      setLoading(false);
    }
    load();
  }, [showToast]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      email_primary: emailPrimary,
      email_direct: emailDirect,
      phone_whatsapp: phoneWhatsapp,
      phone_whatsapp_link: phoneWhatsappLink,
      location,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (recordId) {
      ({ error } = await supabase.from('contact_content').update(payload).eq('id', recordId));
    } else {
      const res = await supabase.from('contact_content').insert(payload).select().maybeSingle();
      error = res.error;
      if (res.data) setRecordId(res.data.id);
    }

    setSaving(false);
    if (error) {
      showToast('Save failed: ' + error.message, 'error');
    } else {
      showToast('Contact content saved');
    }
  }

  if (loading) return <div className={styles.loading}><Spinner /></div>;

  return (
    <div className={styles.page}>
      {toast && <Toast message={toast.message} type={toast.type} />}

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Contact Page</h1>
        <p className={styles.pageDesc}>Edit the email addresses, phone number, and office location shown on the contact page.</p>
      </div>

      <form onSubmit={handleSave} className={styles.form}>
        {/* Email Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Email Addresses</h2>
          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.label}>
                Primary / Business Development Email
                <span className={styles.req}>*</span>
              </label>
              <input
                type="email"
                className={styles.input}
                value={emailPrimary}
                onChange={e => setEmailPrimary(e.target.value)}
                placeholder="freshkite-business-development@freshkite.io"
                required
              />
              <p className={styles.hint}>Shown as the main contact email on the page.</p>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>
                Direct Email
                <span className={styles.req}>*</span>
              </label>
              <input
                type="email"
                className={styles.input}
                value={emailDirect}
                onChange={e => setEmailDirect(e.target.value)}
                placeholder="arshad@freshkite.io"
                required
              />
              <p className={styles.hint}>Direct personal email address shown alongside the primary.</p>
            </div>
          </div>
        </section>

        {/* Phone Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Phone / WhatsApp</h2>
          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.label}>
                Display Number
                <span className={styles.req}>*</span>
              </label>
              <input
                type="text"
                className={styles.input}
                value={phoneWhatsapp}
                onChange={e => setPhoneWhatsapp(e.target.value)}
                placeholder="+230 598 96 888"
                required
              />
              <p className={styles.hint}>Shown as the visible phone number (e.g. +230 598 96 888).</p>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>
                WhatsApp Link Number
                <span className={styles.req}>*</span>
              </label>
              <input
                type="text"
                className={styles.input}
                value={phoneWhatsappLink}
                onChange={e => setPhoneWhatsappLink(e.target.value)}
                placeholder="23059896888"
                required
              />
              <p className={styles.hint}>Digits only for the wa.me link (no spaces, no +). Example: 23059896888</p>
            </div>
          </div>
        </section>

        {/* Location Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Office Location</h2>
          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.label}>
                Location
                <span className={styles.req}>*</span>
              </label>
              <input
                type="text"
                className={styles.input}
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Ebène, Mauritius"
                required
              />
              <p className={styles.hint}>City and country shown in the contact page footer.</p>
            </div>
          </div>
        </section>

        <div className={styles.formFooter}>
          <button type="submit" className={styles.saveBtn} disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px 0' }}>
      <div style={{ width: 24, height: 24, border: '2px solid var(--color-border)', borderTopColor: 'var(--color-teal)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Toast({ message, type }) {
  const colors = {
    success: { bg: 'var(--color-success-light)', border: 'rgba(16,185,129,0.25)', text: 'var(--color-success)' },
    error: { bg: 'var(--color-error-light)', border: 'rgba(239,68,68,0.25)', text: 'var(--color-error)' },
  };
  const c = colors[type] ?? colors.success;
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
      borderRadius: 'var(--radius-md)', padding: '12px 20px',
      fontSize: 14, fontWeight: 500, boxShadow: 'var(--shadow-md)',
      animation: 'fadeUp 0.2s ease',
    }}>
      {message}
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }`}</style>
    </div>
  );
}
