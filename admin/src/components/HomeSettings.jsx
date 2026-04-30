import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';
import styles from './Settings.module.css';

const DEFAULT_SERVICE = { title: '', description: '' };
const DEFAULT_TESTIMONIAL = { quote: '', author: '', role: '', company: '' };

export default function HomeSettings() {
  const [recordId, setRecordId] = useState(null);
  const [heroHeadline, setHeroHeadline] = useState('');
  const [heroSubheading, setHeroSubheading] = useState('');
  const [heroCta, setHeroCta] = useState('');
  const [services, setServices] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
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
        .from('home_content')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        showToast('Failed to load home content', 'error');
      } else if (data) {
        setRecordId(data.id);
        setHeroHeadline(data.hero_headline);
        setHeroSubheading(data.hero_subheading);
        setHeroCta(data.hero_cta_label);
        setServices(data.services ?? []);
        setTestimonials(data.testimonials ?? []);
      }
      setLoading(false);
    }
    load();
  }, [showToast]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      hero_headline: heroHeadline,
      hero_subheading: heroSubheading,
      hero_cta_label: heroCta,
      services,
      testimonials,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (recordId) {
      ({ error } = await supabase.from('home_content').update(payload).eq('id', recordId));
    } else {
      const res = await supabase.from('home_content').insert(payload).select().maybeSingle();
      error = res.error;
      if (res.data) setRecordId(res.data.id);
    }

    setSaving(false);
    if (error) {
      showToast('Save failed: ' + error.message, 'error');
    } else {
      showToast('Home content saved');
    }
  }

  // Services helpers
  function updateService(i, field, value) {
    setServices(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  }
  function addService() {
    setServices(prev => [...prev, { ...DEFAULT_SERVICE }]);
  }
  function removeService(i) {
    setServices(prev => prev.filter((_, idx) => idx !== i));
  }
  function moveService(i, dir) {
    setServices(prev => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  // Testimonials helpers
  function updateTestimonial(i, field, value) {
    setTestimonials(prev => prev.map((t, idx) => idx === i ? { ...t, [field]: value } : t));
  }
  function addTestimonial() {
    setTestimonials(prev => [...prev, { ...DEFAULT_TESTIMONIAL }]);
  }
  function removeTestimonial(i) {
    setTestimonials(prev => prev.filter((_, idx) => idx !== i));
  }

  if (loading) return <div className={styles.loading}><Spinner /></div>;

  return (
    <div className={styles.page}>
      {toast && <Toast message={toast.message} type={toast.type} />}

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Home Page</h1>
        <p className={styles.pageDesc}>Edit hero text, services, and testimonials shown on the landing page.</p>
      </div>

      <form onSubmit={handleSave} className={styles.form}>
        {/* Hero Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Hero</h2>
          <div className={styles.fieldGroup}>
            <Field label="Headline" required>
              <input
                type="text"
                className={styles.input}
                value={heroHeadline}
                onChange={e => setHeroHeadline(e.target.value)}
                placeholder="We run the ops, you run the vision."
                required
              />
            </Field>
            <Field label="Subheading" required>
              <textarea
                className={styles.textarea}
                rows={3}
                value={heroSubheading}
                onChange={e => setHeroSubheading(e.target.value)}
                placeholder="Supporting description…"
                required
              />
            </Field>
            <Field label="CTA Button Label" required>
              <input
                type="text"
                className={styles.input}
                value={heroCta}
                onChange={e => setHeroCta(e.target.value)}
                placeholder="Start a project"
                required
              />
            </Field>
          </div>
        </section>

        {/* Services Section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Services</h2>
            <button type="button" className={styles.addBtn} onClick={addService}>+ Add service</button>
          </div>
          <div className={styles.listStack}>
            {services.length === 0 && (
              <p className={styles.empty}>No services yet. Add one above.</p>
            )}
            {services.map((s, i) => (
              <div key={i} className={styles.listCard}>
                <div className={styles.listCardIndex}>{i + 1}</div>
                <div className={styles.listCardFields}>
                  <input
                    type="text"
                    className={styles.input}
                    value={s.title}
                    onChange={e => updateService(i, 'title', e.target.value)}
                    placeholder="Service title"
                  />
                  <input
                    type="text"
                    className={styles.input}
                    value={s.description}
                    onChange={e => updateService(i, 'description', e.target.value)}
                    placeholder="Short description"
                  />
                </div>
                <div className={styles.listCardActions}>
                  <button type="button" className={styles.iconBtn} onClick={() => moveService(i, -1)} disabled={i === 0} title="Move up">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg>
                  </button>
                  <button type="button" className={styles.iconBtn} onClick={() => moveService(i, 1)} disabled={i === services.length - 1} title="Move down">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                  </button>
                  <button type="button" className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => removeService(i)} title="Remove">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Testimonials</h2>
            <button type="button" className={styles.addBtn} onClick={addTestimonial}>+ Add testimonial</button>
          </div>
          <div className={styles.listStack}>
            {testimonials.length === 0 && (
              <p className={styles.empty}>No testimonials yet. Add one above.</p>
            )}
            {testimonials.map((t, i) => (
              <div key={i} className={styles.listCard}>
                <div className={styles.listCardIndex}>{i + 1}</div>
                <div className={styles.listCardFields}>
                  <textarea
                    className={styles.textarea}
                    rows={2}
                    value={t.quote}
                    onChange={e => updateTestimonial(i, 'quote', e.target.value)}
                    placeholder="Quote text…"
                  />
                  <div className={styles.inlineFields}>
                    <input
                      type="text"
                      className={styles.input}
                      value={t.author}
                      onChange={e => updateTestimonial(i, 'author', e.target.value)}
                      placeholder="Author name"
                    />
                    <input
                      type="text"
                      className={styles.input}
                      value={t.role}
                      onChange={e => updateTestimonial(i, 'role', e.target.value)}
                      placeholder="Role"
                    />
                    <input
                      type="text"
                      className={styles.input}
                      value={t.company}
                      onChange={e => updateTestimonial(i, 'company', e.target.value)}
                      placeholder="Company"
                    />
                  </div>
                </div>
                <div className={styles.listCardActions}>
                  <button type="button" className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => removeTestimonial(i)} title="Remove">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></svg>
                  </button>
                </div>
              </div>
            ))}
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

function Field({ label, required, children }) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>
        {label}
        {required && <span className={styles.req}>*</span>}
      </label>
      {children}
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
