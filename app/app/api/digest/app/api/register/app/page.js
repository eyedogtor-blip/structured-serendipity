'use client';

import { useState, useEffect, useCallback } from 'react';

const NUM_QUERIES = 6;

const TOPIC_KEYWORDS = {
  'Diagnostic Imaging': ['radiology', 'radiograph', 'ultrasound', 'imaging', 'x-ray', 'ct scan', 'mri', 'diagnostic imaging'],
  'Clinical Decision Support': ['diagnosis', 'clinical decision', 'differential', 'prognosis', 'treatment recommendation', 'decision support'],
  'Practice Management': ['practice management', 'workflow', 'scheduling', 'billing', 'client communication', 'efficiency', 'automation'],
  'Pathology & Lab': ['pathology', 'cytology', 'histology', 'laboratory', 'blood work', 'urinalysis', 'lab results'],
  'Telemedicine': ['telemedicine', 'telehealth', 'remote', 'virtual consult', 'teleconsult'],
  'Livestock & Production': ['livestock', 'cattle', 'poultry', 'swine', 'dairy', 'production animal', 'farm', 'herd'],
  'Research & Academia': ['study', 'research', 'university', 'published', 'journal', 'peer-reviewed', 'clinical trial'],
  'Startups & Industry': ['startup', 'company', 'launch', 'funding', 'venture', 'product', 'platform', 'announces']
};

const COLORS = {
  research: { bg: 'rgba(201, 171, 71, 0.12)', text: '#c9ab47', border: 'rgba(201, 171, 71, 0.25)' },
  preprint: { bg: 'rgba(147, 197, 193, 0.12)', text: '#93c5c1', border: 'rgba(147, 197, 193, 0.25)' },
  industry: { bg: 'rgba(201, 171, 71, 0.08)', text: '#d4b957', border: 'rgba(201, 171, 71, 0.2)' },
  news: { bg: 'rgba(255, 255, 255, 0.06)', text: '#a8b5b3', border: 'rgba(255, 255, 255, 0.12)' }
};

const TOPIC_COLORS = ['#c9ab47', '#93c5c1', '#d4b957', '#7fb3ae', '#e0c96b', '#5a9a94', '#b8973d', '#4a8a84'];

const LogoMark = ({ size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <g stroke="#c9ab47" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M38 12 L38 28 L22 28 L22 44 L38 44 L38 50" />
      <path d="M62 12 L62 28 L78 28 L78 44 L62 44 L62 50" />
      <path d="M38 88 L38 72 L22 72 L22 56 L38 56 L38 50" />
      <path d="M62 88 L62 72 L78 72 L78 56 L62 56 L62 50" />
      <path d="M38 50 L62 50" />
      <path d="M30 36 L30 44 L38 44" />
      <path d="M30 64 L30 56 L38 56" />
      <path d="M70 36 L70 44 L62 44" />
      <path d="M70 64 L70 56 L62 56" />
      <path d="M38 12 C28 12, 20 8, 16 14 C12 20, 18 26, 26 22 C32 19, 30 14, 24 16" />
      <path d="M62 12 C72 12, 80 8, 84 14 C88 20, 82 26, 74 22 C68 19, 70 14, 76 16" />
      <path d="M38 88 C28 88, 20 92, 16 86 C12 80, 18 74, 26 78 C32 81, 30 86, 24 84" />
      <path d="M62 88 C72 88, 80 92, 84 86 C88 80, 82 74, 74 78 C68 81, 70 86, 76 84" />
    </g>
  </svg>
);

function categorize(url, title) {
  const u = (url || '').toLowerCase();
  const t = (title || '').toLowerCase();
  if (u.includes('pubmed') || u.includes('ncbi') || u.includes('frontiersin') || u.includes('mdpi') || u.includes('springer') || u.includes('wiley') || u.includes('biomedcentral')) return { type: 'research', label: 'Research' };
  if (u.includes('arxiv') || u.includes('biorxiv') || t.includes('preprint')) return { type: 'preprint', label: 'Preprint' };
  if (u.includes('dvm360') || u.includes('veterinarypracticenews') || u.includes('avma') || u.includes('todaysveterinary') || u.includes('vin.com')) return { type: 'industry', label: 'Industry' };
  return { type: 'news', label: 'News' };
}

function detectTopics(article) {
  const text = `${article.title} ${article.snippet}`.toLowerCase();
  const matches = [];
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw))) matches.push(topic);
  }
  return matches.length ? matches : ['General'];
}

function formatDate(d) {
  if (!d || d === 'Recent') return 'Recent';
  try {
    const date = new Date(d);
    const days = Math.floor((new Date() - date) / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch { return d; }
}

function RegistrationGate({ onRegister }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [org, setOrg] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!name.trim() || !email.trim() || !org.trim()) { setError('All fields are required'); return; }
    if (!email.includes('@')) { setError('Please enter a valid email'); return; }
    setSubmitting(true);
    try {
      await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), org: org.trim() })
      });
    } catch (err) { console.log('Registration error:', err); }
    onRegister({ name: name.trim(), email: email.trim(), org: org.trim() });
  };

  return (
    <div style={regStyles.container}>
      <div style={regStyles.card}>
        <div style={regStyles.logoSection}>
          <LogoMark size={64} />
          <h1 style={regStyles.title}>Structured Serendipity</h1>
          <p style={regStyles.subtitle}>Veterinary AI Intelligence Platform</p>
        </div>
        <div style={regStyles.valueProps}>
          <div style={regStyles.valueProp}><span style={regStyles.valueIcon}>✦</span><span>AI-curated research, news & industry updates</span></div>
          <div style={regStyles.valueProp}><span style={regStyles.valueIcon}>✦</span><span>Weekly synthesized digest for busy leaders</span></div>
          <div style={regStyles.valueProp}><span style={regStyles.valueIcon}>✦</span><span>Topic clustering & trend detection</span></div>
        </div>
        <div style={regStyles.form}>
          <div style={regStyles.inputGroup}>
            <label style={regStyles.label}>Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Dr. Jane Smith" style={regStyles.input} />
          </div>
          <div style={regStyles.inputGroup}>
            <label style={regStyles.label}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@vetclinic.com" style={regStyles.input} />
          </div>
          <div style={regStyles.inputGroup}>
            <label style={regStyles.label}>Organization</label>
            <input type="text" value={org} onChange={e => setOrg(e.target.value)} placeholder="ABC Veterinary Hospital" style={regStyles.input} />
          </div>
          {error && <p style={regStyles.error}>{error}</p>}
          <button type="button" onClick={handleSubmit} disabled={submitting} style={regStyles.button}>{submitting ? 'Creating access...' : 'Get Access'}</button>
        </div>
        <p style={regStyles.footer}>By registering, you will receive occasional updates on veterinary AI developments.</p>
      </div>
    </div>
  );
}

function DigestView({ digest, loading }) {
  const [copied, setCopied] = useState(false);
  const digestText = typeof digest === 'object' ? digest.text : digest;
  const references = typeof digest === 'object' ? digest.references : [];
  
  const handleCopy = () => {
    let copyText = digestText;
    if (references.length > 0) copyText += '\n\n---\nReferences:\n' + references.map((r, i) => `[${i + 1}] ${r.title} - ${r.url}`).join('\n');
    navigator.clipboard.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderTextWithCitations = (text) => {
    if (!text || references.length === 0) return text;
    const parts = text.split(/(\[\d+\])/g);
    return parts.map((part, i) => {
      const match = part.match(/\[(\d+)\]/);
      if (match) {
        const refIndex = parseInt(match[1]) - 1;
        const ref = references[refIndex];
        if (ref) return <a key={i} href={ref.url} target="_blank" rel="noopener noreferrer" style={digestStyles.citationLink} title={ref.title}>{part}</a>;
      }
      return part;
    });
  };

  return (
    <div style={digestStyles.container}>
      <div style={digestStyles.header}>
        <div style={digestStyles.titleRow}><span style={digestStyles.icon}>✦</span><h2 style={digestStyles.title}>Weekly Intelligence Digest</h2></div>
        <span style={digestStyles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>
      {loading ? (
        <div style={digestStyles.loading}>
          <div style={{ width: 44, height: 44, border: '2px solid #1a3d3d', borderTopColor: '#c9ab47', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <span style={{ color: '#93c5c1', fontSize: '0.95rem', marginTop: '1rem' }}>Synthesizing insights...</span>
        </div>
      ) : digestText ? (
        <>
          <div style={digestStyles.content}>{digestText.split('\n\n').map((para, i) => <p key={i} style={digestStyles.para}>{renderTextWithCitations(para)}</p>)}</div>
          {references.length > 0 && (
            <div style={digestStyles.referencesSection}>
              <h3 style={digestStyles.referencesTitle}>References</h3>
              <div style={digestStyles.referencesList}>
                {references.map((ref, i) => (
                  <a key={i} href={ref.url} target="_blank" rel="noopener noreferrer" style={digestStyles.referenceItem}>
                    <span style={digestStyles.refNumber}>[{i + 1}]</span>
                    <span style={digestStyles.refTitle}>{ref.title}</span>
                    <span style={digestStyles.refSource}>{ref.source}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
          <div style={digestStyles.actions}><button onClick={handleCopy} style={digestStyles.actionBtn}>{copied ? '✓ Copied' : '📋 Copy to clipboard'}</button></div>
        </>
      ) : (
        <div style={digestStyles.loading}><span style={{ color: '#7a9a97' }}>Click Digest to generate your briefing</span></div>
      )}
    </div>
  );
}

function TopicsView({ clusters, selectedTopic, onSelectTopic, articles, saved, notes, onToggleSave, onUpdateNote }) {
  const sortedTopics = Object.entries(clusters).sort((a, b) => b[1].length - a[1].length);
  if (selectedTopic) {
    return (
      <div>
        <button onClick={() => onSelectTopic(null)} style={styles.backButton}>← All Topics</button>
        <h2 style={styles.topicTitle}>{selectedTopic} <span style={styles.topicCount}>({articles.length})</span></h2>
        <FeedView articles={articles} saved={saved} notes={notes} onToggleSave={onToggleSave} onUpdateNote={onUpdateNote} />
      </div>
    );
  }
  return (
    <div>
      <p style={styles.topicsIntro}>Articles clustered by detected themes</p>
      <div style={styles.topicsGrid}>
        {sortedTopics.map(([topic, topicArticles], i) => (
          <button key={topic} onClick={() => onSelectTopic(topic)} style={styles.topicCard}>
            <div style={{ ...styles.topicDot, background: TOPIC_COLORS[i % TOPIC_COLORS.length] }} />
            <div style={styles.topicInfo}><span style={styles.topicName}>{topic}</span><span style={styles.topicArticleCount}>{topicArticles.length} articles</span></div>
            <div style={styles.topicTrend}>{topicArticles.slice(0, 2).map((a, j) => <div key={j} style={styles.topicPreview}>{a.title.substring(0, 55)}...</div>)}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function FeedView({ articles, saved, notes, onToggleSave, onUpdateNote, emptyMessage }) {
  if (articles.length === 0) return <div style={styles.empty}><p>{emptyMessage || 'No articles found.'}</p></div>;
  return (
    <div style={styles.grid}>
      {articles.map((article, i) => <ArticleCard key={article.id} article={article} index={i} isSaved={!!saved[article.id]} note={notes[article.id] || ''} onToggleSave={() => onToggleSave(article)} onUpdateNote={(note) => onUpdateNote(article.id, note)} />)}
    </div>
  );
}

function ArticleCard({ article, index, isSaved, note, onToggleSave, onUpdateNote }) {
  const [hovered, setHovered] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [localNote, setLocalNote] = useState(note);
  const c = COLORS[article.sourceType] || COLORS.news;
  const handleSaveNote = () => { onUpdateNote(localNote); setShowNote(false); };

  return (
    <div style={{ ...styles.card, ...(hovered ? styles.cardHover : {}), animationDelay: `${index * 0.02}s` }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div style={styles.cardTop}>
        <span style={{ ...styles.sourceBadge, background: c.bg, color: c.text, borderColor: c.border }}>{article.source}</span>
        <div style={styles.cardActions}>
          <button onClick={onToggleSave} style={{ ...styles.iconBtn, color: isSaved ? '#c9ab47' : '#5a7a77' }}>{isSaved ? '★' : '☆'}</button>
          <button onClick={() => setShowNote(!showNote)} style={{ ...styles.iconBtn, color: note ? '#93c5c1' : '#5a7a77' }}>✎</button>
        </div>
      </div>
      <a href={article.url} target="_blank" rel="noopener noreferrer" style={styles.cardLink}>
        <h3 style={styles.title}>{article.title}</h3>
        {article.snippet && <p style={styles.snippet}>{article.snippet}</p>}
      </a>
      {article.topics && <div style={styles.topicTags}>{article.topics.slice(0, 2).map(t => <span key={t} style={styles.topicTag}>{t}</span>)}</div>}
      {showNote && (
        <div style={styles.noteBox}>
          <textarea value={localNote} onChange={e => setLocalNote(e.target.value)} placeholder="Add a note..." style={styles.noteInput} />
          <div style={styles.noteActions}><button onClick={handleSaveNote} style={styles.noteSave}>Save</button><button onClick={() => setShowNote(false)} style={styles.noteCancel}>Cancel</button></div>
        </div>
      )}
      {note && !showNote && <div style={styles.notePreview}>📝 {note}</div>}
      <div style={styles.cardBot}><span style={styles.date}>{formatDate(article.date)}</span><span style={styles.sourceLabel}>{article.sourceLabel}</span></div>
    </div>
  );
}

export default function Home() {
  const [user, setUser] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('feed');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [progress, setProgress] = useState({ current: 0, total: NUM_QUERIES });
  const [saved, setSaved] = useState({});
  const [notes, setNotes] = useState({});
  const [digest, setDigest] = useState('');
  const [digestLoading, setDigestLoading] = useState(false);
  const [topicClusters, setTopicClusters] = useState({});
  const [selectedTopic, setSelectedTopic] = useState(null);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setProgress({ current: 0, total: NUM_QUERIES });
    const all = [];
    const seenUrls = new Set();
    const seenTitles = new Set();

    for (let i = 0; i < NUM_QUERIES; i++) {
      setProgress({ current: i + 1, total: NUM_QUERIES });
      try {
        const res = await fetch(`/api/search?q=${i}`);
        const data = await res.json();
        const text = data.content?.filter(b => b.type === 'text').map(b => b.text).join('\n') || '';
        const match = text.match(/\[[\s\S]*\]/);
        if (match) {
          try {
            const parsed = JSON.parse(match[0]);
            if (Array.isArray(parsed)) {
              for (const a of parsed) {
                if (a.title && a.url && !seenUrls.has(a.url)) {
                  const titleKey = a.title.toLowerCase().substring(0, 50);
                  if (!seenTitles.has(titleKey)) {
                    seenUrls.add(a.url);
                    seenTitles.add(titleKey);
                    const cat = categorize(a.url, a.title);
                    const topics = detectTopics(a);
                    all.push({ id: `a-${all.length}`, ...a, sourceType: cat.type, sourceLabel: cat.label, topics });
                  }
                }
              }
            }
          } catch {}
        }
      } catch (e) { console.error(e); }
      if (i < NUM_QUERIES - 1) await new Promise(r => setTimeout(r, 400));
    }
    const clusters = {};
    for (const article of all) { for (const topic of article.topics) { if (!clusters[topic]) clusters[topic] = []; clusters[topic].push(article); } }
    setTopicClusters(clusters);
    setArticles(all);
    setLoading(false);
  }, []);

  useEffect(() => { if (user) { setLoading(true); fetchArticles(); } }, [user, fetchArticles]);

  const generateDigest = async () => {
    setView('digest');
    if (articles.length === 0) { setDigest({ text: 'No articles loaded yet.', references: [] }); return; }
    setDigestLoading(true);
    setDigest('');
    const digestArticles = articles.slice(0, 25);
    try {
      const res = await fetch('/api/digest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ articles: digestArticles }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const text = data.content?.filter(b => b.type === 'text').map(b => b.text).join('\n') || '';
      if (!text) throw new Error('No content');
      setDigest({ text, references: digestArticles });
    } catch (e) { setDigest({ text: `Failed: ${e.message}`, references: [] }); }
    setDigestLoading(false);
  };

  const toggleSave = (article) => { setSaved(prev => { const next = { ...prev }; if (next[article.id]) delete next[article.id]; else next[article.id] = article; return next; }); };
  const updateNote = (articleId, note) => { setNotes(prev => ({ ...prev, [articleId]: note })); };

  const getFilteredArticles = () => {
    let filtered = view === 'saved' ? Object.values(saved) : selectedTopic ? topicClusters[selectedTopic] || [] : articles;
    if (filter !== 'all') filtered = filtered.filter(a => a.sourceType === filter);
    if (search) { const q = search.toLowerCase(); filtered = filtered.filter(a => a.title?.toLowerCase().includes(q) || a.snippet?.toLowerCase().includes(q)); }
    return filtered;
  };

  const filteredArticles = getFilteredArticles();
  const savedCount = Object.keys(saved).length;

  if (!user) return <RegistrationGate onRegister={setUser} />;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logo}><div style={styles.logoIcon}><LogoMark size={36} /></div><div style={styles.logoText}><span style={styles.logoMark}>Structured Serendipity</span><span style={styles.logoSub}>Veterinary AI Intelligence</span></div></div>
          <div style={styles.viewTabs}>
            <button onClick={() => { setView('feed'); setSelectedTopic(null); }} style={{ ...styles.viewTab, ...(view === 'feed' && !selectedTopic ? styles.viewTabActive : {}) }}>Feed</button>
            <button onClick={() => { setView('topics'); setSelectedTopic(null); }} style={{ ...styles.viewTab, ...(view === 'topics' || selectedTopic ? styles.viewTabActive : {}) }}>Topics</button>
            <button onClick={() => { setView('saved'); setSelectedTopic(null); }} style={{ ...styles.viewTab, ...(view === 'saved' ? styles.viewTabActive : {}) }}>Saved {savedCount > 0 && <span style={styles.savedBadge}>{savedCount}</span>}</button>
            <button onClick={generateDigest} style={{ ...styles.viewTab, ...styles.digestBtn, ...(view === 'digest' ? styles.viewTabActive : {}) }}>✦ Digest</button>
            <div style={styles.userMenu}><span style={styles.userName}>{user.name?.split(' ')[0]}</span></div>
          </div>
        </div>
      </header>
      {view !== 'digest' && (
        <div style={styles.controls}>
          <div style={styles.controlsInner}>
            <div style={styles.searchWrap}>
              <svg style={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input type="text" placeholder="Search articles..." value={search} onChange={e => setSearch(e.target.value)} style={styles.searchInput} />
            </div>
            <div style={styles.filterTabs}>{['all', 'research', 'preprint', 'industry', 'news'].map(f => <button key={f} onClick={() => setFilter(f)} style={{ ...styles.filterTab, ...(filter === f ? styles.filterTabActive : {}) }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>)}</div>
            <div style={styles.stats}>
              <span style={styles.count}><span style={{ color: '#c9ab47' }}>{filteredArticles.length}</span> articles</span>
              <button onClick={fetchArticles} disabled={loading} style={styles.refresh}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg></button>
            </div>
          </div>
        </div>
      )}
      <main style={styles.main}>
        {loading ? (
          <div style={styles.loading}><div style={styles.spinner} /><span style={styles.loadingText}>Discovering insights... ({progress.current}/{progress.total})</span></div>
        ) : view === 'digest' ? (
          <DigestView digest={digest} loading={digestLoading} />
        ) : view === 'topics' || selectedTopic ? (
          <TopicsView clusters={topicClusters} selectedTopic={selectedTopic} onSelectTopic={setSelectedTopic} articles={filteredArticles} saved={saved} notes={notes} onToggleSave={toggleSave} onUpdateNote={updateNote} />
        ) : (
          <FeedView articles={filteredArticles} saved={saved} notes={notes} onToggleSave={toggleSave} onUpdateNote={updateNote} emptyMessage={view === 'saved' ? 'No saved articles yet.' : 'No articles found.'} />
        )}
      </main>
      <footer style={styles.footer}><span>Structured Serendipity — Where intention meets discovery</span></footer>
    </div>
  );
}

const regStyles = {
  container: { minHeight: '100vh', background: 'linear-gradient(135deg, #0a2020 0%, #0f2a2a 50%, #122e2e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: "'DM Sans', sans-serif" },
  card: { background: 'rgba(255,255,255,0.02)', border: '1px solid #1a3d3d', borderRadius: 16, padding: '3rem', maxWidth: 440, width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)' },
  logoSection: { textAlign: 'center', marginBottom: '2rem' },
  title: { fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.75rem', color: '#c9ab47', marginTop: '1rem', marginBottom: '0.35rem', fontWeight: 400 },
  subtitle: { color: '#7a9a97', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.15em' },
  valueProps: { background: 'rgba(201,171,71,0.05)', border: '1px solid rgba(201,171,71,0.15)', borderRadius: 8, padding: '1.25rem', marginBottom: '2rem' },
  valueProp: { display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#b8c5c3', fontSize: '0.9rem', marginBottom: '0.65rem' },
  valueIcon: { color: '#c9ab47', fontSize: '0.8rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { color: '#7a9a97', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' },
  input: { padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.04)', border: '1px solid #1a3d3d', borderRadius: 6, color: '#e8ebe9', fontSize: '1rem', outline: 'none' },
  error: { color: '#e57373', fontSize: '0.85rem', margin: 0 },
  button: { padding: '1rem', background: 'linear-gradient(135deg, #c9ab47 0%, #b8973d 100%)', border: 'none', borderRadius: 6, color: '#0a2020', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', marginTop: '0.5rem' },
  footer: { textAlign: 'center', color: '#5a7a77', fontSize: '0.75rem', marginTop: '1.5rem', lineHeight: 1.5 }
};

const digestStyles = {
  container: { maxWidth: 800, margin: '0 auto' },
  header: { marginBottom: '2.5rem', borderBottom: '1px solid #1a3d3d', paddingBottom: '1.5rem' },
  titleRow: { display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' },
  icon: { color: '#c9ab47', fontSize: '1.5rem' },
  title: { fontSize: '1.75rem', color: '#c9ab47', fontWeight: 400, fontFamily: "'Playfair Display', Georgia, serif", margin: 0 },
  date: { fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: '#5a7a77' },
  loading: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '4rem' },
  content: { lineHeight: 1.9 },
  para: { marginBottom: '1.75rem', fontSize: '1.1rem', color: '#d4dbd8', fontFamily: "'Playfair Display', Georgia, serif" },
  citationLink: { color: '#c9ab47', textDecoration: 'none', fontWeight: 500, borderBottom: '1px dotted #c9ab47' },
  referencesSection: { marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #1a3d3d' },
  referencesTitle: { fontSize: '1.1rem', color: '#93c5c1', marginBottom: '1.25rem', fontWeight: 400, fontFamily: "'Playfair Display', Georgia, serif" },
  referencesList: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  referenceItem: { display: 'flex', alignItems: 'baseline', gap: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 6, textDecoration: 'none' },
  refNumber: { color: '#c9ab47', fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', fontWeight: 600, flexShrink: 0 },
  refTitle: { color: '#e8ebe9', fontSize: '0.9rem', flex: 1 },
  refSource: { color: '#5a7a77', fontSize: '0.75rem', fontFamily: "'DM Sans', sans-serif", flexShrink: 0 },
  actions: { marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #1a3d3d' },
  actionBtn: { padding: '0.7rem 1.25rem', background: 'rgba(201,171,71,0.1)', border: '1px solid rgba(201,171,71,0.25)', borderRadius: 6, color: '#c9ab47', fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', cursor: 'pointer' }
};

const styles = {
  container: { minHeight: '100vh', background: '#0f2a2a', color: '#e8ebe9', fontFamily: "'Playfair Display', Georgia, serif" },
  header: { background: 'linear-gradient(180deg, #0a2020 0%, #0f2a2a 100%)', borderBottom: '1px solid #1a3d3d', padding: '1.25rem 2rem', position: 'sticky', top: 0, zIndex: 100 },
  headerInner: { maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' },
  logo: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  logoIcon: { opacity: 0.9 },
  logoText: { display: 'flex', flexDirection: 'column' },
  logoMark: { fontSize: '1.4rem', color: '#c9ab47', fontWeight: 400 },
  logoSub: { fontSize: '0.65rem', color: '#7a9a97', textTransform: 'uppercase', letterSpacing: '0.2em', fontFamily: "'DM Sans', sans-serif" },
  viewTabs: { display: 'flex', gap: '0.5rem', alignItems: 'center' },
  viewTab: { padding: '0.6rem 1.1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid #1a3d3d', borderRadius: 6, color: '#7a9a97', fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  viewTabActive: { background: 'rgba(201,171,71,0.1)', color: '#c9ab47', borderColor: 'rgba(201,171,71,0.3)' },
  digestBtn: { background: 'linear-gradient(135deg, rgba(201,171,71,0.1), rgba(147,197,193,0.05))' },
  savedBadge: { background: '#c9ab47', color: '#0f2a2a', fontSize: '0.6rem', padding: '0.15rem 0.45rem', borderRadius: 10, fontWeight: 600 },
  userMenu: { display: 'flex', alignItems: 'center', marginLeft: '0.5rem', paddingLeft: '0.75rem', borderLeft: '1px solid #1a3d3d' },
  userName: { color: '#7a9a97', fontSize: '0.85rem', fontFamily: "'DM Sans', sans-serif" },
  controls: { background: '#0d2424', borderBottom: '1px solid #1a3d3d', padding: '1rem 2rem' },
  controlsInner: { maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' },
  searchWrap: { position: 'relative', flex: 1, minWidth: 200, maxWidth: 300 },
  searchIcon: { position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#5a7a77' },
  searchInput: { width: '100%', padding: '0.7rem 1rem 0.7rem 2.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid #1a3d3d', borderRadius: 6, color: '#e8ebe9', fontSize: '0.85rem', outline: 'none' },
  filterTabs: { display: 'flex', gap: '0.25rem', background: 'rgba(255,255,255,0.02)', padding: '0.25rem', borderRadius: 6, border: '1px solid #1a3d3d' },
  filterTab: { padding: '0.5rem 0.75rem', background: 'transparent', border: 'none', borderRadius: 4, color: '#5a7a77', fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', cursor: 'pointer' },
  filterTabActive: { background: 'rgba(201,171,71,0.1)', color: '#c9ab47' },
  stats: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem' },
  count: { fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: '#7a9a97' },
  refresh: { padding: '0.5rem', background: 'transparent', border: '1px solid #1a3d3d', borderRadius: 6, color: '#7a9a97', cursor: 'pointer', display: 'flex' },
  main: { maxWidth: 1400, margin: '0 auto', padding: '2rem' },
  loading: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: '1.5rem' },
  spinner: { width: 44, height: 44, border: '2px solid #1a3d3d', borderTopColor: '#c9ab47', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  loadingText: { fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', color: '#7a9a97' },
  empty: { textAlign: 'center', padding: '4rem 2rem', color: '#5a7a77' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.25rem' },
  card: { background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)', border: '1px solid #1a3d3d', borderRadius: 10, padding: '1.35rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', animation: 'fadeIn 0.4s ease forwards', opacity: 0 },
  cardHover: { background: 'linear-gradient(135deg, rgba(201,171,71,0.05) 0%, rgba(255,255,255,0.02) 100%)', borderColor: '#2a4d4d', transform: 'translateY(-2px)' },
  cardLink: { textDecoration: 'none', color: 'inherit' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardActions: { display: 'flex', gap: '0.25rem' },
  iconBtn: { background: 'none', border: 'none', fontSize: '1.15rem', cursor: 'pointer', padding: '0.25rem' },
  sourceBadge: { padding: '0.25rem 0.55rem', borderRadius: 4, fontFamily: "'DM Sans', sans-serif", fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.08em', border: '1px solid' },
  title: { fontSize: '1.1rem', lineHeight: 1.4, fontWeight: 400, color: '#e8ebe9' },
  snippet: { fontSize: '0.85rem', color: '#93a5a3', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontFamily: "'DM Sans', sans-serif" },
  topicTags: { display: 'flex', gap: '0.4rem', flexWrap: 'wrap' },
  topicTag: { fontSize: '0.65rem', color: '#7a9a97', background: 'rgba(255,255,255,0.04)', padding: '0.2rem 0.55rem', borderRadius: 4, fontFamily: "'DM Sans', sans-serif" },
  cardBot: { marginTop: 'auto', paddingTop: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' },
  date: { fontFamily: "'DM Sans', sans-serif", fontSize: '0.7rem', color: '#5a7a77' },
  sourceLabel: { fontSize: '0.7rem', color: '#5a7a77', fontFamily: "'DM Sans', sans-serif" },
  noteBox: { background: 'rgba(0,0,0,0.2)', border: '1px solid #1a3d3d', borderRadius: 6, padding: '0.75rem' },
  noteInput: { width: '100%', background: 'transparent', border: 'none', color: '#e8ebe9', fontSize: '0.8rem', resize: 'none', minHeight: 50, outline: 'none' },
  noteActions: { display: 'flex', gap: '0.5rem', marginTop: '0.5rem' },
  noteSave: { padding: '0.35rem 0.75rem', background: '#c9ab47', border: 'none', borderRadius: 4, color: '#0f2a2a', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer' },
  noteCancel: { padding: '0.35rem 0.75rem', background: 'transparent', border: '1px solid #1a3d3d', borderRadius: 4, color: '#7a9a97', fontSize: '0.75rem', cursor: 'pointer' },
  notePreview: { fontSize: '0.75rem', color: '#93c5c1', background: 'rgba(147,197,193,0.08)', padding: '0.55rem 0.75rem', borderRadius: 6, fontFamily: "'DM Sans', sans-serif" },
  topicsIntro: { color: '#7a9a97', marginBottom: '1.5rem', fontFamily: "'DM Sans', sans-serif" },
  topicsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' },
  topicCard: { background: 'rgba(255,255,255,0.02)', border: '1px solid #1a3d3d', borderRadius: 10, padding: '1.25rem', textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  topicDot: { width: 10, height: 10, borderRadius: '50%' },
  topicInfo: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  topicName: { fontSize: '1.1rem', color: '#e8ebe9' },
  topicArticleCount: { fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', color: '#5a7a77' },
  topicTrend: { display: 'flex', flexDirection: 'column', gap: '0.35rem' },
  topicPreview: { fontSize: '0.75rem', color: '#5a7a77', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: "'DM Sans', sans-serif" },
  backButton: { background: 'none', border: 'none', color: '#c9ab47', fontSize: '0.9rem', cursor: 'pointer', marginBottom: '1rem', padding: 0, fontFamily: "'DM Sans', sans-serif" },
  topicTitle: { fontSize: '1.5rem', marginBottom: '1.5rem', color: '#e8ebe9' },
  topicCount: { color: '#5a7a77', fontWeight: 400 },
  footer: { textAlign: 'center', padding: '2rem', borderTop: '1px solid #1a3d3d', marginTop: '2rem', color: '#3a5a57', fontSize: '0.8rem', fontStyle: 'italic' }
};
