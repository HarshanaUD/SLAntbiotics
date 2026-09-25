import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search, Activity, Heart, Wind, Stethoscope, ArrowRight,
  ShieldAlert, Pill, Microscope, Home, BookOpen,
  ChevronRight, AlertTriangle, Droplets,
  Baby, X, Menu, FlaskConical, Brain, Ear,
  Eye, Bone, Syringe, Shield, Zap, Thermometer, Sun, Moon
} from 'lucide-react';
import data from './data.json';

/* ── System definitions ─────────────────────────────────── */
const systems = [
  { id: 'Respiratory Tract Infections',      icon: Wind,         grad: 'from-sky-500 to-blue-600',      glow: 'rgba(14,165,233,0.3)'   },
  { id: 'Ear, Nose and Throat Infections',   icon: Ear,          grad: 'from-amber-500 to-orange-600',  glow: 'rgba(245,158,11,0.3)'   },
  { id: 'Eye Infections',                    icon: Eye,          grad: 'from-teal-500 to-cyan-600',     glow: 'rgba(20,184,166,0.3)'   },
  { id: 'Central Nervous System Infections', icon: Brain,        grad: 'from-indigo-500 to-blue-700',   glow: 'rgba(99,102,241,0.3)'   },
  { id: 'Bacterial Endocarditis',            icon: Heart,        grad: 'from-rose-500 to-pink-600',     glow: 'rgba(244,63,94,0.3)'    },
  { id: 'Bone and Joint Infections',         icon: Bone,         grad: 'from-orange-500 to-red-600',    glow: 'rgba(249,115,22,0.3)'   },
  { id: 'Intra-abdominal Infection',         icon: FlaskConical, grad: 'from-emerald-500 to-teal-600',  glow: 'rgba(16,185,129,0.3)'   },
  { id: 'Diarrhoea',                         icon: Droplets,     grad: 'from-cyan-500 to-blue-500',     glow: 'rgba(6,182,212,0.3)'    },
  { id: 'Urinary Tract Infections (UTI)',    icon: Zap,          grad: 'from-violet-500 to-purple-600', glow: 'rgba(139,92,246,0.3)'   },
  { id: 'Skin and Soft Tissue Infections',   icon: Activity,     grad: 'from-pink-500 to-rose-600',     glow: 'rgba(236,72,153,0.3)'   },
  { id: 'Sepsis/ Septic Shock',              icon: Thermometer,  grad: 'from-red-600 to-orange-700',    glow: 'rgba(220,38,38,0.3)'    },
  { id: 'Prophylaxis: Surgical',             icon: Shield,       grad: 'from-slate-500 to-slate-700',   glow: 'rgba(100,116,139,0.3)'  },
];

/* ── AWaRe data ─────────────────────────────────────────── */
const awareData = {
  Access: {
    color: '#34d399',
    bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.25)',
    desc: 'Narrow spectrum. First-line choice for most common infections. Widely available and low resistance risk.',
    drugs: Object.entries(data.antibiotics)
      .filter(([, v]) => v.aware_category === 'Access' || v.aware === 'Access')
      .map(([, v]) => v.name),
  },
  Watch: {
    color: '#fbbf24',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.25)',
    desc: 'Higher resistance potential. Use carefully and monitor consumption.',
    drugs: Object.entries(data.antibiotics)
      .filter(([, v]) => v.aware_category === 'Watch' || v.aware === 'Watch')
      .map(([, v]) => v.name),
  },
  Reserve: {
    color: '#f87171',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.25)',
    desc: 'Last-resort antibiotics. Use only for severe infections with MDR pathogens.',
    drugs: Object.entries(data.antibiotics)
      .filter(([, v]) => v.aware_category === 'Reserve' || v.aware === 'Reserve')
      .map(([, v]) => v.name),
  },
};

/* ── Tab definitions ────────────────────────────────────── */
const TABS = [
  { id: 'home',    label: 'Home',      icon: Home       },
  { id: 'disease', label: 'Diseases',  icon: Microscope },
  { id: 'drugs',   label: 'Drugs',     icon: Pill       },
  { id: 'guide',   label: 'Reference', icon: BookOpen   },
];

/* ── Main App ───────────────────────────────────────────── */
export default function App() {
  const [searchTerm,      setSearchTerm]      = useState('');
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [selectedDrug,    setSelectedDrug]    = useState(null);
  const [activeTab,       setActiveTab]       = useState('home');
  const [sidebarOpen,     setSidebarOpen]     = useState(false);
  const [darkMode,        setDarkMode]        = useState(false);
  const [awareOpen,       setAwareOpen]       = useState(false);
  const [infoModal,       setInfoModal]       = useState(null); // 'disclaimer' | 'privacy' | 'about'
  const [systemFilter,    setSystemFilter]    = useState(null); // for system click → disease list

  const diseasesList = useMemo(() =>
    Object.entries(data.diseases).map(([id, val]) => ({ id, ...val })), []);
  const drugsList = useMemo(() =>
    Object.entries(data.antibiotics).map(([id, val]) => ({ id, ...val })), []);

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return { diseases: [], drugs: [] };
    const lower = searchTerm.toLowerCase();
    return {
      diseases: diseasesList.filter(d =>
        d.name.toLowerCase().includes(lower) || d.system?.toLowerCase().includes(lower)),
      drugs: drugsList.filter(d => d.name.toLowerCase().includes(lower))
    };
  }, [searchTerm, diseasesList, drugsList]);

  const hasSearch = searchTerm.trim().length > 0;

  const openDisease = (id) => { setSelectedDisease(id); setSelectedDrug(null); };
  const openDrug    = (id) => { setSelectedDrug(id); };
  const goBack      = () => {
    if (selectedDrug && selectedDisease) { setSelectedDrug(null); }
    else if (selectedDrug)  { setSelectedDrug(null); }
    else if (selectedDisease) { setSelectedDisease(null); }
  };
  const goHome = () => {
    setSelectedDisease(null);
    setSelectedDrug(null);
    setSearchTerm('');
    setActiveTab('home');
    setSystemFilter(null);
  };

  const handleSystemClick = (sysId) => {
    setSystemFilter(sysId);
    setActiveTab('disease');
    setSelectedDisease(null);
    setSelectedDrug(null);
    setSearchTerm('');
  };

  /* current "page" for mobile header breadcrumb */
  const pageTitle = selectedDrug
    ? (data.antibiotics[selectedDrug]?.name || 'Drug')
    : selectedDisease
      ? (data.diseases[selectedDisease]?.name || 'Disease')
      : hasSearch
        ? 'Search Results'
        : activeTab === 'disease' ? 'Diseases'
        : activeTab === 'drugs'   ? 'Antibiotics'
        : activeTab === 'guide'   ? 'Reference'
        : 'Antibiogram';

  const showBackBtn = selectedDisease || selectedDrug;

  /* ── Theme CSS vars ─────────────────────────────────────── */
  const theme = darkMode ? darkTheme : lightTheme;

  /* ── Sidebar item ───────────────────────────────────────── */
  const SidebarItem = ({ tab }) => {
    const Icon = tab.icon;
    const isActive = activeTab === tab.id && !selectedDisease && !selectedDrug && !hasSearch;
    return (
      <button
        onClick={() => { setActiveTab(tab.id); setSelectedDisease(null); setSelectedDrug(null); setSearchTerm(''); setSidebarOpen(false); setSystemFilter(null); }}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
          padding: '10px 14px', borderRadius: '12px', border: '1px solid transparent',
          transition: 'all 0.2s', textAlign: 'left', cursor: 'pointer',
          background: isActive ? theme.navActiveBg : 'transparent',
          borderColor: isActive ? theme.navActiveBorder : 'transparent',
          color: isActive ? theme.navActiveText : theme.textMuted,
          boxShadow: isActive ? theme.navActiveGlow : 'none',
        }}
      >
        <Icon size={18} style={{ color: isActive ? theme.accent : 'inherit' }} />
        <span style={{ fontSize: '14px', fontWeight: 500 }}>{tab.label}</span>
      </button>
    );
  };

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', background: theme.pageBg, color: theme.textPrimary, fontFamily: "'Inter', system-ui, sans-serif", position: 'relative' }}>

      {/* Animated liquid background (light mode only, CSS only, no heavy assets) */}
      {!darkMode && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          {/* Main white base */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, #ffffff 60%, #e0f7fa 100%)' }} />
          {/* Animated cyan blob top-left */}
          <div style={{
            position: 'absolute', top: '-120px', left: '-100px',
            width: '520px', height: '520px',
            background: 'radial-gradient(circle at 40% 40%, rgba(6,182,212,0.38) 0%, rgba(14,165,233,0.18) 40%, transparent 70%)',
            borderRadius: '50%',
            animation: 'liquidBlob1 8s ease-in-out infinite',
            filter: 'blur(2px)',
          }} />
          {/* Secondary smaller blob */}
          <div style={{
            position: 'absolute', top: '80px', left: '-60px',
            width: '300px', height: '300px',
            background: 'radial-gradient(circle, rgba(6,182,212,0.22) 0%, transparent 70%)',
            borderRadius: '50%',
            animation: 'liquidBlob2 11s ease-in-out infinite 2s',
            filter: 'blur(1px)',
          }} />
          {/* Subtle wave ripple */}
          <div style={{
            position: 'absolute', top: '-40px', left: '-40px',
            width: '380px', height: '380px',
            border: '2px solid rgba(6,182,212,0.12)',
            borderRadius: '50%',
            animation: 'liquidRipple 6s ease-in-out infinite',
          }} />
          <style>{`
            @keyframes liquidBlob1 {
              0%,100% { transform: translate(0,0) scale(1); }
              33%      { transform: translate(30px,40px) scale(1.08); }
              66%      { transform: translate(-20px,20px) scale(0.96); }
            }
            @keyframes liquidBlob2 {
              0%,100% { transform: translate(0,0) scale(1) rotate(0deg); }
              50%      { transform: translate(20px,-30px) scale(1.1) rotate(15deg); }
            }
            @keyframes liquidRipple {
              0%,100% { transform: scale(1); opacity: 0.6; }
              50%      { transform: scale(1.15); opacity: 0.2; }
            }
          `}</style>
        </div>
      )}
      {/* Dark background orbs */}
      {darkMode && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0a0f1e 0%, #0f172a 50%, #0d1b2a 100%)' }} />
          <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: '-100px', left: '20%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)', borderRadius: '50%' }} />
        </div>
      )}

      {/* ── AWaRe Popup Modal ──────────────────────────────── */}
      {awareOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px',
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(6px)',
        }} onClick={() => setAwareOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            width: '100%', maxWidth: '520px', maxHeight: '80vh',
            borderRadius: '20px', overflow: 'hidden',
            background: darkMode ? 'rgba(13,20,36,0.98)' : '#ffffff',
            border: darkMode ? '1px solid rgba(6,182,212,0.25)' : '1px solid rgba(6,182,212,0.3)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
            display: 'flex', flexDirection: 'column',
          }}>
            {/* Modal header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 24px 16px',
              borderBottom: darkMode ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(6,182,212,0.15)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #0891b2, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(6,182,212,0.35)' }}>
                  <ShieldAlert size={17} color="white" />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: darkMode ? '#f1f5f9' : '#0f172a' }}>WHO AWaRe Classification</h2>
                  <p style={{ margin: 0, fontSize: '11px', color: darkMode ? '#64748b' : '#64748b', fontWeight: 500 }}>Antibiotic stewardship framework</p>
                </div>
              </div>
              <button onClick={() => setAwareOpen(false)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: darkMode ? '#94a3b8' : '#64748b' }}>
                <X size={16} />
              </button>
            </div>
            {/* Modal body */}
            <div style={{ overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {Object.entries(awareData).map(([cat, info]) => (
                <div key={cat} style={{ borderRadius: '14px', overflow: 'hidden', border: `1px solid ${info.border}`, background: info.bg }}>
                  <div style={{ padding: '12px 16px', borderBottom: `1px solid ${info.border}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: info.color, display: 'inline-block', flexShrink: 0, boxShadow: `0 0 8px ${info.color}` }} />
                    <span style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: info.color }}>{cat}</span>
                    <span style={{ marginLeft: 'auto', fontSize: '11px', color: darkMode ? '#475569' : '#64748b', fontWeight: 600 }}>{info.desc}</span>
                  </div>
                  <div style={{ padding: '12px 16px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {info.drugs.length > 0 ? info.drugs.map(d => (
                      <span key={d} style={{
                        padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                        background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                        border: `1px solid ${info.border}`, color: info.color,
                      }}>{d}</span>
                    )) : (
                      <span style={{ fontSize: '12px', color: darkMode ? '#475569' : '#94a3b8', fontStyle: 'italic' }}>
                        See full drug profiles for AWaRe classifications
                      </span>
                    )}
                  </div>
                </div>
              ))}
              <div style={{ padding: '10px 14px', borderRadius: '10px', background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', border: darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}>
                <p style={{ margin: 0, fontSize: '11px', color: darkMode ? '#475569' : '#64748b', lineHeight: 1.6 }}>
                  Source: WHO AWaRe Classification 2021. Antibiotic classifications may vary per individual drug profile in this database.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop Sidebar ──────────────────────────────── */}
      <aside style={{
        display: 'none', position: 'sticky', top: 0, height: '100vh',
        width: '264px', flexShrink: 0, flexDirection: 'column',
        background: darkMode ? 'rgba(15,23,42,0.88)' : 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(24px)',
        borderRight: darkMode ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(6,182,212,0.18)',
        zIndex: 10,
      }} className="lg-sidebar">
        {/* Logo */}
        <div style={{ padding: '24px 20px 16px', borderBottom: darkMode ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(6,182,212,0.15)' }}>
          <button onClick={goHome} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: '100%' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'linear-gradient(135deg, #0891b2, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(6,182,212,0.4)', flexShrink: 0 }}>
              <Microscope size={18} color="white" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: darkMode ? '#ffffff' : '#0f172a', lineHeight: 1 }}>Antibiogram</p>
              <p style={{ margin: '3px 0 0', fontSize: '10px', color: '#06b6d4', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>SLCM 2024</p>
            </div>
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '14px 14px 10px' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} size={14} />
            <input
              type="text"
              placeholder="Search diseases or drugs…"
              style={{
                width: '100%', padding: '9px 32px 9px 32px', borderRadius: '12px', fontSize: '13px',
                background: darkMode ? 'rgba(18,27,48,0.9)' : 'rgba(6,182,212,0.07)',
                border: darkMode ? '1.5px solid rgba(255,255,255,0.08)' : '1.5px solid rgba(6,182,212,0.25)',
                color: darkMode ? '#e2e8f0' : '#0f172a', outline: 'none', boxSizing: 'border-box',
              }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '6px 10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {TABS.map(tab => <SidebarItem key={tab.id} tab={tab} />)}
        </nav>

        {/* Theme Toggle + Footer */}
        <div style={{ padding: '14px', borderTop: darkMode ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(6,182,212,0.15)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <ThemeToggle dark={darkMode} onToggle={() => setDarkMode(!darkMode)} theme={theme} />
          <div style={{ padding: '12px', borderRadius: '12px', background: darkMode ? 'rgba(18,27,48,0.7)' : 'rgba(6,182,212,0.07)', border: darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(6,182,212,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#34d399', display: 'inline-block', animation: 'pulseDot 2.5s ease-in-out infinite' }} />
              <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: '#34d399' }}>Offline Ready</p>
            </div>
            <p style={{ margin: 0, fontSize: '10px', color: darkMode ? '#475569' : '#64748b', lineHeight: 1.5 }}>Sri Lanka College of Microbiologists — National Guidelines 2nd Ed.</p>
          </div>
          {/* Footer links */}
          <SidebarFooter onInfo={setInfoModal} dark={darkMode} />
        </div>
      </aside>

      {/* ── Mobile Sidebar Overlay ───────────────────────── */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }} className="lg-hidden">
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setSidebarOpen(false)} />
          <div style={{ position: 'relative', width: '280px', height: '100%', display: 'flex', flexDirection: 'column', background: darkMode ? 'rgba(10,15,30,0.98)' : 'rgba(255,255,255,0.98)', borderRight: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(6,182,212,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', borderBottom: darkMode ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(6,182,212,0.12)' }}>
              <button onClick={() => { goHome(); setSidebarOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', cursor: 'pointer' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #0891b2, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Microscope size={15} color="white" />
                </div>
                <span style={{ fontWeight: 800, color: darkMode ? '#ffffff' : '#0f172a', fontSize: '15px' }}>Antibiogram</span>
              </button>
              <button onClick={() => setSidebarOpen(false)} style={{ width: '32px', height: '32px', border: 'none', borderRadius: '8px', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: darkMode ? '#94a3b8' : '#64748b' }}>
                <X size={18} />
              </button>
            </div>
            <nav style={{ flex: 1, padding: '10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {TABS.map(tab => <SidebarItem key={tab.id} tab={tab} />)}
            </nav>
            <div style={{ padding: '14px', borderTop: darkMode ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(6,182,212,0.12)' }}>
              <ThemeToggle dark={darkMode} onToggle={() => setDarkMode(!darkMode)} theme={theme} />
            </div>
          </div>
        </div>
      )}

      {/* ── Main Panel ──────────────────────────────────── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100dvh', overflow: 'hidden', position: 'relative', zIndex: 1 }}>

        {/* ── Top Bar ─────────────────────────────────── */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 30,
          background: darkMode ? 'rgba(10,16,30,0.85)' : 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(20px)',
          borderBottom: darkMode ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(6,182,212,0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px' }} className="header-inner">
            {/* Mobile hamburger / back */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="mobile-only">
              {showBackBtn ? (
                <button onClick={goBack} style={iconBtnStyle(darkMode)}>
                  <ArrowRight size={18} style={{ transform: 'rotate(180deg)' }} />
                </button>
              ) : (
                <button onClick={() => setSidebarOpen(true)} style={iconBtnStyle(darkMode)}>
                  <Menu size={18} />
                </button>
              )}
            </div>

            {/* Desktop back */}
            {showBackBtn && (
              <button onClick={goBack} style={{ ...iconBtnStyle(darkMode), display: 'none' }} className="desktop-back">
                <ArrowRight size={18} style={{ transform: 'rotate(180deg)' }} />
              </button>
            )}

            {/* Title */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: darkMode ? '#ffffff' : '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pageTitle}</h1>
              {selectedDisease && !selectedDrug && (
                <p style={{ margin: '1px 0 0', fontSize: '11px', color: darkMode ? '#475569' : '#64748b' }}>{data.diseases[selectedDisease]?.system}</p>
              )}
            </div>

            {/* Desktop theme toggle */}
            <div className="desktop-only">
              <ThemeToggle dark={darkMode} onToggle={() => setDarkMode(!darkMode)} theme={theme} compact />
            </div>

            {/* Logo (mobile) → home */}
            <button onClick={goHome} style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #0891b2, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', flexShrink: 0, boxShadow: '0 0 14px rgba(6,182,212,0.35)' }} className="mobile-logo">
              <Microscope size={15} color="white" />
            </button>
          </div>

          {/* Mobile Search Bar */}
          {!selectedDisease && !selectedDrug && (
            <div style={{ padding: '0 14px 12px' }} className="mobile-only">
              <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} size={14} />
                <input
                  type="text"
                  placeholder="Search diseases or drugs…"
                  style={{
                    width: '100%', padding: '9px 32px 9px 32px', borderRadius: '12px', fontSize: '13px', boxSizing: 'border-box',
                    background: darkMode ? 'rgba(18,27,48,0.9)' : 'rgba(6,182,212,0.07)',
                    border: darkMode ? '1.5px solid rgba(255,255,255,0.08)' : '1.5px solid rgba(6,182,212,0.25)',
                    color: darkMode ? '#e2e8f0' : '#0f172a', outline: 'none',
                  }}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>
          )}
        </header>

        {/* ── Page Content ───────────────────────────────── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 96px', background: 'transparent' }} className="main-scroll">
          {selectedDrug ? (
            <DrugMonograph key={selectedDrug} drugId={selectedDrug} theme={theme} />
          ) : selectedDisease ? (
            <DiseaseView key={selectedDisease} diseaseId={selectedDisease} onSelectDrug={openDrug} theme={theme} />
          ) : hasSearch ? (
            <SearchResults key={searchTerm} results={searchResults} onSelectDisease={openDisease} onSelectDrug={openDrug} theme={theme} />
          ) : activeTab === 'disease' ? (
            <DiseasesPage onSelectDisease={openDisease} theme={theme} initialFilter={systemFilter} onClearFilter={() => setSystemFilter(null)} />
          ) : activeTab === 'drugs' ? (
            <DrugsPage onSelectDrug={openDrug} theme={theme} />
          ) : activeTab === 'guide' ? (
            <ReferencePage theme={theme} />
          ) : (
            <HomePage onSelectDisease={openDisease} onSelectDrug={openDrug} onTabChange={setActiveTab} onSystemClick={handleSystemClick} onAwareOpen={() => setAwareOpen(true)} onInfoOpen={(k) => setInfoModal(k)} theme={theme} />
          )}
        </div>

        {/* ── Mobile Bottom Navigation ────────────────────── */}
        <nav style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 30,
          background: darkMode ? 'rgba(10,16,30,0.95)' : 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: darkMode ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(6,182,212,0.2)',
        }} className="mobile-only">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '8px 8px 12px' }}>
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id && !selectedDisease && !selectedDrug && !hasSearch;
              return (
                <button key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setSelectedDisease(null); setSelectedDrug(null); setSearchTerm(''); setSystemFilter(null); }}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
                    padding: '6px 12px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                    background: 'transparent',
                    color: isActive ? '#06b6d4' : (darkMode ? '#64748b' : '#94a3b8'),
                    transition: 'all 0.2s', minWidth: '56px',
                  }}>
                  <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', background: isActive ? (darkMode ? 'rgba(6,182,212,0.15)' : 'rgba(6,182,212,0.12)') : 'transparent', transition: 'all 0.2s' }}>
                    <Icon size={18} />
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 600 }}>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </main>

      {/* ── Info Modal ──────────────────────────────────── */}
      {infoModal && <InfoModal type={infoModal} onClose={() => setInfoModal(null)} dark={darkMode} />}

      {/* ── Global Styles ───────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Inter', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(6,182,212,0.3); border-radius: 99px; }
        @keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.5)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideInRight { from{opacity:0;transform:translateX(22px)} to{opacity:1;transform:translateX(0)} }
        @keyframes shimmer { from{transform:translateX(-100%)} to{transform:translateX(100%)} }
        .animate-fade-in { animation: fadeIn 0.35s ease-out both; }
        .animate-slide-up { animation: slideUp 0.4s ease-out both; }
        .animate-slide-in-right { animation: slideInRight 0.32s ease-out both; }

        /* Responsive sidebar visibility */
        @media (min-width: 1024px) {
          .lg-sidebar { display: flex !important; }
          .mobile-only { display: none !important; }
          .desktop-only { display: flex !important; }
          .desktop-back { display: flex !important; }
          .mobile-logo { display: none !important; }
          .main-scroll { padding: 24px 32px 32px !important; }
          .header-inner { padding: 12px 28px !important; }
        }
        @media (max-width: 1023px) {
          .lg-sidebar { display: none !important; }
          .mobile-only { display: flex !important; }
          .desktop-only { display: none !important; }
          .desktop-back { display: none !important; }
        }
      `}</style>
    </div>
  );
}

/* ── Theme tokens ─────────────────────────────────────────── */
const darkTheme = {
  pageBg:           'transparent',
  cardBg:           'rgba(13,20,36,0.82)',
  cardBorder:       'rgba(255,255,255,0.07)',
  cardHoverBg:      'rgba(22,32,56,0.9)',
  cardHoverBorder:  'rgba(6,182,212,0.28)',
  textPrimary:      '#f1f5f9',
  textSecondary:    '#94a3b8',
  textMuted:        '#475569',
  accent:           '#22d3ee',
  accentBg:         'rgba(6,182,212,0.12)',
  accentBorder:     'rgba(6,182,212,0.3)',
  navActiveBg:      'rgba(6,182,212,0.12)',
  navActiveBorder:  'rgba(6,182,212,0.35)',
  navActiveText:    '#22d3ee',
  navActiveGlow:    '0 0 16px rgba(6,182,212,0.08) inset',
  inputBg:          'rgba(18,27,48,0.9)',
  inputBorder:      'rgba(255,255,255,0.08)',
  sysBtnBg:         'rgba(13,20,36,0.85)',
  sysBtnBorder:     'rgba(255,255,255,0.07)',
  heroBg:           'linear-gradient(135deg, rgba(6,42,82,0.9) 0%, rgba(10,20,50,0.95) 40%, rgba(15,8,40,0.9) 100%)',
  statsBg:          'rgba(10,16,32,0.9)',
  statsItemBg:      'rgba(255,255,255,0.03)',
  listItemBg:       'rgba(255,255,255,0.03)',
  listItemBorder:   'rgba(255,255,255,0.05)',
};
const lightTheme = {
  pageBg:           'transparent',
  cardBg:           'rgba(255,255,255,0.82)',
  cardBorder:       'rgba(6,182,212,0.18)',
  cardHoverBg:      'rgba(255,255,255,0.98)',
  cardHoverBorder:  'rgba(6,182,212,0.45)',
  textPrimary:      '#0f172a',
  textSecondary:    '#334155',
  textMuted:        '#64748b',
  accent:           '#0891b2',
  accentBg:         'rgba(6,182,212,0.1)',
  accentBorder:     'rgba(6,182,212,0.35)',
  navActiveBg:      'rgba(6,182,212,0.12)',
  navActiveBorder:  'rgba(6,182,212,0.4)',
  navActiveText:    '#0891b2',
  navActiveGlow:    '0 0 16px rgba(6,182,212,0.1) inset',
  inputBg:          'rgba(6,182,212,0.06)',
  inputBorder:      'rgba(6,182,212,0.25)',
  sysBtnBg:         'rgba(255,255,255,0.85)',
  sysBtnBorder:     'rgba(6,182,212,0.2)',
  heroBg:           'linear-gradient(135deg, rgba(224,247,250,0.95) 0%, rgba(207,250,254,0.85) 50%, rgba(240,249,255,0.9) 100%)',
  statsBg:          'rgba(255,255,255,0.9)',
  statsItemBg:      'rgba(6,182,212,0.07)',
  listItemBg:       'rgba(6,182,212,0.04)',
  listItemBorder:   'rgba(6,182,212,0.15)',
};

/* ── Helpers ─────────────────────────────────────────────── */
function iconBtnStyle(dark) {
  return {
    width: '36px', height: '36px', borderRadius: '10px', border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
    background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(6,182,212,0.08)',
    color: dark ? '#94a3b8' : '#0891b2',
  };
}

function card(theme, extra = {}) {
  return {
    background: theme.cardBg,
    border: `1px solid ${theme.cardBorder}`,
    borderRadius: '18px',
    backdropFilter: 'blur(20px)',
    ...extra,
  };
}

/* ── Theme Toggle ─────────────────────────────────────────── */
/* ── Sidebar Footer ──────────────────────────────────────── */
function SidebarFooter({ onInfo, dark }) {
  const btnStyle = {
    background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px',
    borderRadius: '6px', fontSize: '10px', fontWeight: 600, transition: 'all 0.18s',
    color: dark ? '#475569' : '#64748b',
  };
  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', justifyContent: 'center', marginBottom: '6px' }}>
        {[['Disclaimer', 'disclaimer'], ['Privacy', 'privacy'], ['About', 'about']].map(([label, key]) => (
          <button key={key} style={btnStyle}
            onClick={() => onInfo(key)}
            onMouseEnter={e => { e.currentTarget.style.color = '#06b6d4'; e.currentTarget.style.background = dark ? 'rgba(6,182,212,0.08)' : 'rgba(6,182,212,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = dark ? '#475569' : '#64748b'; e.currentTarget.style.background = 'none'; }}>
            {label}
          </button>
        ))}
      </div>
      <p style={{ textAlign: 'center', fontSize: '10px', color: dark ? '#334155' : '#94a3b8', lineHeight: 1.4 }}>
        Designed by <span style={{ color: dark ? '#475569' : '#64748b', fontWeight: 600 }}>Dr. Harshana Daraniyagala</span>
      </p>
    </div>
  );
}

/* ── Info Modal ───────────────────────────────────────────── */
const INFO_CONTENT = {
  disclaimer: {
    title: 'Clinical Disclaimer',
    icon: '⚠️',
    color: '#fbbf24',
    border: 'rgba(245,158,11,0.3)',
    bg: 'rgba(245,158,11,0.06)',
    body: 'This application was developed as a quick-reference digital tool based entirely on the publicly available \'National Guidelines on Empirical and Prophylactic Use of Antimicrobials - Sri Lanka (Second Edition - 2024)\' published by the Sri Lanka College of Microbiologists.\n\nThis app is intended for educational and reference purposes only and does not supersede clinical judgment. The developer assumes no responsibility for clinical decisions made using this application. Always consult the official guidelines and specialized medical professionals when prescribing.\n\nIf you find any discrepancies between this app and the official SLCM guidelines, please refer to the official document and contact the developer.',
  },
  privacy: {
    title: 'Privacy Policy',
    icon: '🔒',
    color: '#34d399',
    border: 'rgba(16,185,129,0.3)',
    bg: 'rgba(16,185,129,0.06)',
    body: 'This application operates entirely offline (as a Progressive Web App) once loaded.\n\nIt does not collect, store, transmit, or process any personal user data, patient data, or analytics. No backend databases track your usage or search history.\n\nAll guideline data is bundled locally within the application for maximum speed and privacy.',
  },
  about: {
    title: 'About the Developer',
    icon: '👨‍⚕️',
    color: '#22d3ee',
    border: 'rgba(6,182,212,0.3)',
    bg: 'rgba(6,182,212,0.06)',
    body: 'This application was created by Dr. Harshana Daraniyagala to facilitate faster, offline access to national clinical guidelines during ward rounds and daily clinical practice. It leverages modern web technologies to ensure immediate access even in areas with poor network coverage.',
    extra: {
      name: 'Dr. Harshana Daraniyagala',
      role: 'Medical Doctor | Senior House Officer, Surgery',
      hospital: 'District General Hospital Kegalle',
      linkedin: 'https://www.linkedin.com/in/harshana-daraniyagala-1ba5b466/',
      email: 'HarshanaUD@gmail.com',
    },
  },
};

function InfoModal({ type, onClose, dark }) {
  const info = INFO_CONTENT[type];
  if (!info) return null;
  const paragraphs = info.body.split('\n\n');
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: '500px', maxHeight: '82vh',
        borderRadius: '22px', overflow: 'hidden',
        background: dark ? 'rgba(11,17,35,0.98)' : '#ffffff',
        border: `1px solid ${info.border}`,
        boxShadow: `0 24px 80px rgba(0,0,0,0.55), 0 0 40px ${info.border}`,
        display: 'flex', flexDirection: 'column',
        animation: 'modalIn 0.28s cubic-bezier(0.34,1.56,0.64,1) both',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 22px 14px',
          borderBottom: `1px solid ${info.border}`,
          background: info.bg,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px', lineHeight: 1 }}>{info.icon}</span>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: dark ? '#f1f5f9' : '#0f172a' }}>{info.title}</h2>
          </div>
          <button onClick={onClose} style={{
            width: '30px', height: '30px', borderRadius: '8px', border: 'none',
            background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: dark ? '#94a3b8' : '#64748b',
          }}>
            <X size={15} />
          </button>
        </div>
        {/* Body */}
        <div style={{ overflowY: 'auto', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {paragraphs.map((p, i) => (
            <p key={i} style={{ fontSize: '13px', color: dark ? '#94a3b8' : '#334155', lineHeight: 1.75, margin: 0 }}>{p}</p>
          ))}
          {info.extra && (
            <div style={{
              marginTop: '4px', padding: '16px', borderRadius: '14px',
              background: info.bg, border: `1px solid ${info.border}`,
            }}>
              <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: 800, color: info.color }}>{info.extra.name}</p>
              <p style={{ margin: '0 0 1px', fontSize: '12px', color: dark ? '#64748b' : '#475569', fontWeight: 500 }}>{info.extra.role}</p>
              <p style={{ margin: '0 0 14px', fontSize: '12px', color: dark ? '#475569' : '#64748b' }}>{info.extra.hospital}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a href={`mailto:${info.extra.email}`} style={{
                  display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600,
                  color: info.color, textDecoration: 'none', padding: '8px 12px', borderRadius: '9px',
                  background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                  border: `1px solid ${info.border}`,
                }}>
                  <span>✉️</span> {info.extra.email}
                </a>
                <a href={info.extra.linkedin} target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600,
                  color: info.color, textDecoration: 'none', padding: '8px 12px', borderRadius: '9px',
                  background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                  border: `1px solid ${info.border}`,
                }}>
                  <span>🔗</span> LinkedIn Profile
                </a>
              </div>
            </div>
          )}
          {/* App info footer */}
          <div style={{ padding: '12px 14px', borderRadius: '10px', background: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)', marginTop: '4px' }}>
            <p style={{ margin: 0, fontSize: '11px', color: dark ? '#334155' : '#94a3b8', lineHeight: 1.6, textAlign: 'center' }}>
              Antibiotic Guidelines LK · v1.0.0<br />
              Based on SLCM National Guidelines 2nd Ed. 2024
            </p>
          </div>
        </div>
      </div>
      <style>{`@keyframes modalIn { from { opacity:0; transform: scale(0.9) translateY(12px); } to { opacity:1; transform: scale(1) translateY(0); } }`}</style>
    </div>
  );
}

function ThemeToggle({ dark, onToggle, theme, compact }) {
  return (
    <button onClick={onToggle} style={{
      display: 'flex', alignItems: 'center', gap: compact ? '6px' : '10px',
      padding: compact ? '7px 12px' : '10px 14px', borderRadius: '12px', border: 'none', cursor: 'pointer', transition: 'all 0.25s',
      background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(6,182,212,0.1)',
      color: dark ? '#94a3b8' : '#0891b2',
      width: compact ? 'auto' : '100%',
    }}>
      <div style={{ width: '28px', height: '16px', borderRadius: '8px', position: 'relative', background: dark ? 'rgba(6,182,212,0.3)' : 'rgba(6,182,212,0.4)', transition: 'background 0.3s', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: '2px', left: dark ? '14px' : '2px', width: '12px', height: '12px', borderRadius: '50%', background: dark ? '#22d3ee' : '#0891b2', transition: 'left 0.25s', boxShadow: '0 1px 4px rgba(0,0,0,0.25)' }} />
      </div>
      {!compact && <span style={{ fontSize: '12px', fontWeight: 600 }}>{dark ? 'Dark Mode' : 'Light Mode'}</span>}
      {dark ? <Moon size={14} /> : <Sun size={14} />}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════
   HOME PAGE
═══════════════════════════════════════════════════════════ */
function HomePage({ onSelectDisease, onSelectDrug, onTabChange, onSystemClick, onAwareOpen, onInfoOpen, theme }) {
  const dark = theme === darkTheme;
  const diseasesList = Object.entries(data.diseases).map(([id, val]) => ({ id, ...val }));
  const drugsList    = Object.entries(data.antibiotics).map(([id, val]) => ({ id, ...val }));
  const systemCount  = systems.length;

  const gradColors = {
    'Respiratory Tract Infections':      '#0ea5e9,#2563eb',
    'Ear, Nose and Throat Infections':   '#f59e0b,#ea580c',
    'Eye Infections':                    '#14b8a6,#0891b2',
    'Central Nervous System Infections': '#6366f1,#3730a3',
    'Bacterial Endocarditis':            '#f43f5e,#db2777',
    'Bone and Joint Infections':         '#f97316,#dc2626',
    'Intra-abdominal Infection':         '#10b981,#0d9488',
    'Diarrhoea':                         '#06b6d4,#3b82f6',
    'Urinary Tract Infections (UTI)':   '#8b5cf6,#6366f1',
    'Skin and Soft Tissue Infections':   '#ec4899,#f43f5e',
    'Sepsis/ Septic Shock':              '#dc2626,#ea580c',
    'Prophylaxis: Surgical':             '#64748b,#475569',
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto', overflow: 'hidden' }}>

      {/* ── TOP ROW ──────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '14px', marginBottom: '14px' }} className="home-top-row">

        {/* Hero */}
        <div style={{ ...card(theme), ...{ background: theme.heroBg, padding: '2rem 2.25rem', position: 'relative', overflow: 'hidden', minHeight: '210px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' } }}>
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', background: dark ? 'radial-gradient(circle, rgba(6,182,212,0.18) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(6,182,212,0.28) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22d3ee', display: 'inline-block', animation: 'pulseDot 2.5s ease-in-out infinite' }} />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#06b6d4', letterSpacing: '0.12em', textTransform: 'uppercase' }}>SLCM · 2nd Edition · 2024</span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.4rem)', fontWeight: 900, lineHeight: 1.1, color: dark ? '#ffffff' : '#0c4a6e', marginBottom: '10px', letterSpacing: '-0.02em' }}>
              Empirical &amp; Prophylactic<br />
              <span style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #38bdf8 40%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Antimicrobial Guide</span>
            </h1>
            <p style={{ fontSize: '14px', color: dark ? '#94a3b8' : '#0369a1', lineHeight: 1.65, maxWidth: '480px' }}>
              National Guidelines by the Sri Lanka College of Microbiologists for evidence-based antimicrobial prescribing.
            </p>
          </div>
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
            <HoverButton onClick={() => onTabChange('disease')} color="#22d3ee" dark={dark}>
              <Microscope size={14} /> Browse Diseases
            </HoverButton>
            <HoverButton onClick={() => onTabChange('drugs')} color="#a78bfa" dark={dark}>
              <Pill size={14} /> Antibiotic Index
            </HoverButton>
          </div>
        </div>

        {/* Stats */}
        <div style={{ ...card(theme), ...{ background: theme.statsBg, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '155px', justifyContent: 'center' } }}>
          {[
            { value: diseasesList.length, label: 'Clinical Guidelines', color: '#22d3ee' },
            { value: drugsList.length,    label: 'Antibiotic Profiles', color: '#a78bfa' },
            { value: systemCount,         label: 'Body Systems',        color: '#34d399' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '12px 14px', borderRadius: '12px', background: theme.statsItemBg, border: `1px solid ${theme.cardBorder}`, textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1, color: s.color, letterSpacing: '-0.04em' }}>{s.value}</div>
              <div style={{ fontSize: '10px', color: theme.textMuted, fontWeight: 600, marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── BODY SYSTEMS ─────────────────────────────────── */}
      <div style={{ ...card(theme), ...{ padding: '1.5rem', marginBottom: '14px' } }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 800, color: theme.textPrimary }}>Body Systems</h2>
            <p style={{ fontSize: '12px', color: theme.textMuted, fontWeight: 500, marginTop: '2px' }}>Click a system to browse its guidelines</p>
          </div>
          <button onClick={() => onTabChange('disease')} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, color: theme.accent, background: 'none', border: 'none', cursor: 'pointer', padding: '6px 10px', borderRadius: '8px', transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = theme.accentBg}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
            View all <ChevronRight size={13} />
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '10px' }} className="systems-grid">
          {systems.map((sys, idx) => {
            const Icon = sys.icon;
            const cols = gradColors[sys.id] || '#10b981,#0d9488';
            return (
              <button key={sys.id} onClick={() => onSystemClick(sys.id)} style={{
                background: theme.sysBtnBg, border: `1px solid ${theme.sysBtnBorder}`, borderRadius: '16px',
                padding: '14px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                cursor: 'pointer', position: 'relative', overflow: 'hidden', transition: 'all 0.25s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.03)'; e.currentTarget.style.borderColor = theme.cardHoverBorder; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = theme.sysBtnBorder; e.currentTarget.style.boxShadow = ''; }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', background: `radial-gradient(circle at 50% 0%, ${sys.glow.replace('0.3', dark ? '0.1' : '0.07')} 0%, transparent 70%)`, pointerEvents: 'none' }} />
                <div style={{ width: '42px', height: '42px', borderRadius: '13px', background: `linear-gradient(135deg, ${cols})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 6px 20px ${sys.glow}`, position: 'relative', zIndex: 1 }}>
                  <Icon size={20} color="white" />
                </div>
                <span style={{ fontSize: '10px', fontWeight: 700, color: dark ? '#94a3b8' : '#0369a1', textAlign: 'center', lineHeight: 1.3, position: 'relative', zIndex: 1 }}>{sys.id}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── BOTTOM BENTO ─────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', minWidth: 0 }} className="home-bottom-row">

        {/* Clinical Guidelines */}
        <div style={{ ...card(theme), ...{ padding: '1.5rem' } }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #0891b2, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(6,182,212,0.3)' }}>
                <Microscope size={16} color="white" />
              </div>
              <div>
                <h2 style={{ fontSize: '14px', fontWeight: 800, color: theme.textPrimary }}>Clinical Guidelines</h2>
                <p style={{ fontSize: '11px', color: theme.textMuted, fontWeight: 500 }}>{diseasesList.length} conditions</p>
              </div>
            </div>
            <button onClick={() => onTabChange('disease')} style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', fontWeight: 700, color: theme.accent, background: 'none', border: 'none', cursor: 'pointer', padding: '5px 8px', borderRadius: '7px' }}>All <ChevronRight size={11} /></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {diseasesList.slice(0, 6).map((d, i) => (
              <button key={d.id} onClick={() => onSelectDisease(d.id)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '11px',
                background: theme.listItemBg, border: `1px solid ${theme.listItemBorder}`, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = theme.accentBg; e.currentTarget.style.borderColor = theme.cardHoverBorder; e.currentTarget.style.transform = 'translateX(3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = theme.listItemBg; e.currentTarget.style.borderColor = theme.listItemBorder; e.currentTarget.style.transform = ''; }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: theme.textPrimary, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</p>
                  <p style={{ fontSize: '11px', color: theme.textMuted, margin: '1px 0 0', fontWeight: 500 }}>{d.system}</p>
                </div>
                <ChevronRight size={13} style={{ color: theme.textMuted, flexShrink: 0 }} />
              </button>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Antibiotic Profiles */}
          <div style={{ ...card(theme), ...{ padding: '1.5rem', flex: 1 } }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(139,92,246,0.3)' }}>
                  <Pill size={16} color="white" />
                </div>
                <div>
                  <h2 style={{ fontSize: '14px', fontWeight: 800, color: theme.textPrimary }}>Antibiotic Profiles</h2>
                  <p style={{ fontSize: '11px', color: theme.textMuted, fontWeight: 500 }}>{drugsList.length} antibiotics</p>
                </div>
              </div>
              <button onClick={() => onTabChange('drugs')} style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', fontWeight: 700, color: '#a78bfa', background: 'none', border: 'none', cursor: 'pointer', padding: '5px 8px', borderRadius: '7px' }}>All <ChevronRight size={11} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {drugsList.slice(0, 5).map((drug) => (
                <button key={drug.id} onClick={() => onSelectDrug(drug.id)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '11px',
                  background: theme.listItemBg, border: `1px solid ${theme.listItemBorder}`, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.07)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.25)'; e.currentTarget.style.transform = 'translateX(3px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = theme.listItemBg; e.currentTarget.style.borderColor = theme.listItemBorder; e.currentTarget.style.transform = ''; }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', flexShrink: 0 }} />
                  <p style={{ fontSize: '13px', fontWeight: 600, color: theme.textPrimary, margin: 0, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{drug.name}</p>
                  <ChevronRight size={13} style={{ color: theme.textMuted, flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </div>

          {/* AWaRe Strip — clickable */}
          <button onClick={onAwareOpen} style={{
            ...card(theme),
            padding: '1.1rem 1.4rem', width: '100%', textAlign: 'left', cursor: 'pointer',
            transition: 'all 0.22s', background: dark ? 'rgba(8,14,28,0.9)' : 'rgba(240,249,255,0.9)',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(6,182,212,0.4)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(6,182,212,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = theme.cardBorder; e.currentTarget.style.boxShadow = ''; }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <ShieldAlert size={14} style={{ color: theme.textMuted }} />
              <h3 style={{ fontSize: '11px', fontWeight: 800, color: theme.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>WHO AWaRe Classification</h3>
              <ChevronRight size={12} style={{ color: theme.accent, marginLeft: 'auto' }} />
            </div>
            <div className="aware-badges" style={{ display: 'flex', gap: '8px' }}>
              {[
                { label: 'Access',  cls: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', color: '#34d399' } },
                { label: 'Watch',   cls: { bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)',  color: '#fbbf24' } },
                { label: 'Reserve', cls: { bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)',   color: '#f87171' } },
              ].map(a => (
                <div key={a.label} style={{ flex: 1, borderRadius: '10px', padding: '9px 10px', background: a.cls.bg, border: `1px solid ${a.cls.border}` }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: a.cls.color, display: 'block' }}>{a.label}</span>
                </div>
              ))}
            </div>
          </button>
        </div>
      </div>

      {/* ── Mobile footer links (hidden on desktop via sidebar) ── */}
      <div className="home-mobile-footer" style={{ marginTop: '20px', paddingBottom: '4px' }}>
        <div style={{
          padding: '14px 16px', borderRadius: '16px',
          background: dark ? 'rgba(13,20,36,0.7)' : 'rgba(255,255,255,0.7)',
          border: dark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(6,182,212,0.18)',
          backdropFilter: 'blur(12px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
        }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[['⚠️ Disclaimer', 'disclaimer'], ['🔒 Privacy', 'privacy'], ['👨‍⚕️ About', 'about']].map(([label, key]) => (
              <button key={key}
                onClick={() => onInfoOpen(key)}
                style={{
                  padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                  background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(6,182,212,0.08)',
                  border: dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(6,182,212,0.2)',
                  color: dark ? '#64748b' : '#0891b2', cursor: 'pointer', transition: 'all 0.18s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#06b6d4'; e.currentTarget.style.borderColor = 'rgba(6,182,212,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = dark ? '#64748b' : '#0891b2'; e.currentTarget.style.borderColor = dark ? 'rgba(255,255,255,0.1)' : 'rgba(6,182,212,0.2)'; }}>
                {label}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '10px', color: dark ? '#334155' : '#94a3b8', textAlign: 'center', lineHeight: 1.5, margin: 0 }}>
            Designed by <span style={{ fontWeight: 700, color: dark ? '#475569' : '#64748b' }}>Dr. Harshana Daraniyagala</span>
            <span style={{ margin: '0 6px', opacity: 0.4 }}>·</span>
            Antibiotic Guidelines LK v1.0.0
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .home-top-row { grid-template-columns: 1fr !important; } }
        @media (max-width: 767px) {
          .home-bottom-row { grid-template-columns: 1fr !important; }
          .systems-grid { grid-template-columns: repeat(4,1fr) !important; }
          .aware-badges { flex-direction: column !important; }
        }
        @media (max-width: 520px) { .systems-grid { grid-template-columns: repeat(3,1fr) !important; } }
        @media (max-width: 380px) { .systems-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (min-width: 1024px) { .home-mobile-footer { display: none !important; } }
      `}</style>
    </div>
  );
}

function HoverButton({ onClick, color, children }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 15px', borderRadius: '10px',
      fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
      background: hov ? `${color}25` : `${color}15`,
      border: `1px solid ${color}55`, color,
      transform: hov ? 'translateY(-1px)' : '',
    }} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {children}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════
   DISEASES PAGE
═══════════════════════════════════════════════════════════ */
function DiseasesPage({ onSelectDisease, theme, initialFilter, onClearFilter }) {
  const [filter, setFilter] = useState(initialFilter || 'All');
  const dark = theme === darkTheme;

  useEffect(() => { if (initialFilter) setFilter(initialFilter); }, [initialFilter]);

  const diseasesList = Object.entries(data.diseases).map(([id, val]) => ({ id, ...val }));
  const systemNames  = ['All', ...new Set(diseasesList.map(d => d.system))];
  const filtered     = filter === 'All' ? diseasesList : diseasesList.filter(d => d.system === filter);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '760px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 900, color: theme.textPrimary }}>Clinical Guidelines</h1>
        {filter !== 'All' && (
          <button onClick={() => { setFilter('All'); onClearFilter && onClearFilter(); }} style={{ fontSize: '11px', fontWeight: 700, color: theme.accent, background: theme.accentBg, border: `1px solid ${theme.accentBorder}`, borderRadius: '8px', padding: '5px 10px', cursor: 'pointer' }}>
            <X size={11} style={{ display: 'inline', marginRight: '4px' }} />Clear filter
          </button>
        )}
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', marginBottom: '18px' }}>
        {systemNames.map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
            background: filter === s ? (dark ? 'rgba(6,182,212,0.2)' : 'rgba(6,182,212,0.15)') : 'transparent',
            border: filter === s ? `1px solid ${theme.accentBorder}` : `1px solid ${theme.cardBorder}`,
            color: filter === s ? theme.accent : theme.textMuted,
          }}>{s}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filtered.map((d, i) => (
          <button key={d.id} onClick={() => onSelectDisease(d.id)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: '14px',
            background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
            animationDelay: `${i * 30}ms`,
          }}
            onMouseEnter={e => { e.currentTarget.style.background = theme.cardHoverBg; e.currentTarget.style.borderColor = theme.cardHoverBorder; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(6,182,212,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = theme.cardBg; e.currentTarget.style.borderColor = theme.cardBorder; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '11px', background: 'linear-gradient(135deg, #0891b2, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 14px rgba(6,182,212,0.25)' }}>
              <Microscope size={17} color="white" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: theme.textPrimary, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</p>
              <p style={{ fontSize: '11px', color: theme.textMuted, margin: '2px 0 0', fontWeight: 500 }}>{d.system} · {(d.primary_therapy?.length || 0) + (d.alternative_therapy?.length || 0)} options</p>
            </div>
            <ChevronRight size={16} style={{ color: theme.textMuted, flexShrink: 0 }} />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DRUGS PAGE
═══════════════════════════════════════════════════════════ */
function DrugsPage({ onSelectDrug, theme }) {
  const [q, setQ] = useState('');
  const dark = theme === darkTheme;
  const drugsList = Object.entries(data.antibiotics).map(([id, val]) => ({ id, ...val }));
  const filtered = q ? drugsList.filter(d => d.name.toLowerCase().includes(q.toLowerCase())) : drugsList;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '760px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '20px', fontWeight: 900, color: theme.textPrimary, marginBottom: '18px' }}>Antibiotic Profiles</h1>
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} size={14} />
        <input type="text" placeholder="Filter antibiotics…" style={{
          width: '100%', padding: '10px 36px', borderRadius: '13px', fontSize: '13px', boxSizing: 'border-box', outline: 'none',
          background: theme.inputBg, border: `1.5px solid ${theme.inputBorder}`, color: theme.textPrimary,
        }} value={q} onChange={e => setQ(e.target.value)} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filtered.map((drug, i) => (
          <button key={drug.id} onClick={() => onSelectDrug(drug.id)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: '14px',
            background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = theme.cardHoverBg; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = theme.cardBg; e.currentTarget.style.borderColor = theme.cardBorder; e.currentTarget.style.transform = ''; }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '11px', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 14px rgba(139,92,246,0.25)' }}>
              <Pill size={17} color="white" />
            </div>
            <p style={{ fontSize: '13px', fontWeight: 700, color: theme.textPrimary, margin: 0, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{drug.name}</p>
            <ChevronRight size={16} style={{ color: theme.textMuted, flexShrink: 0 }} />
          </button>
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <Pill size={36} style={{ color: theme.textMuted, marginBottom: '10px' }} />
            <p style={{ color: theme.textMuted, fontSize: '14px' }}>No antibiotics found for "{q}"</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   REFERENCE PAGE
═══════════════════════════════════════════════════════════ */
function ReferencePage({ theme }) {
  const dark = theme === darkTheme;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '760px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: 900, color: theme.textPrimary }}>Quick Reference</h1>

      <div style={{ ...card(theme), padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 800, color: theme.textPrimary, display: 'flex', alignItems: 'center', gap: '8px' }}><BookOpen size={16} style={{ color: theme.accent }} /> WHO AWaRe Classification</h2>
        {[
          { label: 'Access',  color: '#34d399', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', desc: 'Narrow spectrum. First-line choice for most common infections.' },
          { label: 'Watch',   color: '#fbbf24', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', desc: 'Higher resistance potential. Use carefully.' },
          { label: 'Reserve', color: '#f87171', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.25)',  desc: 'Last-resort antibiotics. MDR pathogens only.' },
        ].map(item => (
          <div key={item.label} style={{ borderRadius: '12px', border: `1px solid ${item.border}`, padding: '12px 14px', background: item.bg }}>
            <p style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: item.color, margin: '0 0 4px' }}>{item.label}</p>
            <p style={{ fontSize: '12px', color: dark ? '#94a3b8' : '#334155', margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
          </div>
        ))}
        <div style={{ marginTop: '8px', textAlign: 'center' }}>
          <a href="https://aware.essentialmeds.org/groups" target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '10px',
            fontSize: '12px', fontWeight: 700, textDecoration: 'none', transition: 'all 0.2s',
            background: theme.accentBg, border: `1px solid ${theme.accentBorder}`, color: theme.accent,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = dark ? 'rgba(6,182,212,0.2)' : 'rgba(6,182,212,0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = theme.accentBg; }}>
            View official WHO AWaRe Database <ArrowRight size={14} />
          </a>
        </div>
      </div>

      <div style={{ ...card(theme), padding: '16px', textAlign: 'center' }}>
        <p style={{ fontSize: '12px', color: theme.textMuted, lineHeight: 1.7, margin: 0 }}>
          Source: <span style={{ color: theme.textSecondary, fontWeight: 600 }}>Sri Lanka College of Microbiologists</span><br />
          Empirical &amp; Prophylactic Use of Antimicrobials — National Guidelines, 2nd Ed. 2024<br />
          <span style={{ color: theme.textMuted, fontSize: '11px' }}>ISBN 978-955-8891-07-0</span>
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SEARCH RESULTS
═══════════════════════════════════════════════════════════ */
function SearchResults({ results, onSelectDisease, onSelectDrug, theme }) {
  const total = results.diseases.length + results.drugs.length;
  if (total === 0) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '18px', ...card(theme), display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
          <Search size={26} style={{ color: theme.textMuted }} />
        </div>
        <p style={{ color: theme.textSecondary, fontWeight: 600 }}>No results found</p>
        <p style={{ color: theme.textMuted, fontSize: '13px', marginTop: '4px' }}>Try a different search term</p>
      </div>
    );
  }
  return (
    <div className="animate-fade-in" style={{ maxWidth: '760px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <p style={{ fontSize: '12px', color: theme.textMuted }}>{total} result{total !== 1 ? 's' : ''} found</p>
      {results.diseases.length > 0 && (
        <section>
          <h3 style={{ fontSize: '11px', fontWeight: 900, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Diseases</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            {results.diseases.map(d => (
              <button key={d.id} onClick={() => onSelectDisease(d.id)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '14px', padding: '13px 16px', borderRadius: '13px',
                background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = theme.cardHoverBg; e.currentTarget.style.borderColor = theme.cardHoverBorder; }}
                onMouseLeave={e => { e.currentTarget.style.background = theme.cardBg; e.currentTarget.style.borderColor = theme.cardBorder; }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #0891b2, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Microscope size={14} color="white" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: theme.textPrimary, margin: 0 }}>{d.name}</p>
                  <p style={{ fontSize: '11px', color: theme.textMuted, margin: '1px 0 0' }}>{d.system}</p>
                </div>
                <ChevronRight size={14} style={{ color: theme.textMuted, flexShrink: 0 }} />
              </button>
            ))}
          </div>
        </section>
      )}
      {results.drugs.length > 0 && (
        <section>
          <h3 style={{ fontSize: '11px', fontWeight: 900, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Antibiotics</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            {results.drugs.map(d => (
              <button key={d.id} onClick={() => onSelectDrug(d.id)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '14px', padding: '13px 16px', borderRadius: '13px',
                background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = theme.cardHoverBg; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = theme.cardBg; e.currentTarget.style.borderColor = theme.cardBorder; }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Pill size={14} color="white" />
                </div>
                <p style={{ fontSize: '13px', fontWeight: 700, color: theme.textPrimary, margin: 0, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</p>
                <ChevronRight size={14} style={{ color: theme.textMuted, flexShrink: 0 }} />
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DISEASE VIEW
═══════════════════════════════════════════════════════════ */
function DiseaseView({ diseaseId, onSelectDrug, theme }) {
  const disease = data.diseases[diseaseId];
  if (!disease) return null;
  const dark = theme === darkTheme;

  return (
    <div className="animate-slide-in-right" style={{ maxWidth: '760px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ ...card(theme), padding: '20px', background: dark ? 'linear-gradient(135deg, rgba(6,182,212,0.1) 0%, rgba(59,130,246,0.06) 100%)' : 'linear-gradient(135deg, rgba(6,182,212,0.12) 0%, rgba(59,130,246,0.06) 100%)', borderColor: 'rgba(6,182,212,0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #0891b2, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 6px 20px rgba(6,182,212,0.3)' }}>
            <Microscope size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 900, color: theme.textPrimary, lineHeight: 1.2, margin: '0 0 8px' }}>{disease.name}</h1>
            <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: theme.accentBg, border: `1px solid ${theme.accentBorder}`, color: theme.accent }}>{disease.system}</span>
          </div>
        </div>
      </div>

      {disease.presentation && (
        <div style={{ ...card(theme), padding: '18px' }}>
          <h3 style={{ fontSize: '11px', fontWeight: 900, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}><Activity size={13} style={{ color: '#f43f5e' }} /> Presentation</h3>
          <p style={{ fontSize: '13px', color: theme.textSecondary, lineHeight: 1.65, margin: 0 }}>{disease.presentation}</p>
        </div>
      )}

      {disease.source_control && (
        <div style={{ ...card(theme), padding: '18px' }}>
          <h3 style={{ fontSize: '11px', fontWeight: 900, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}><ShieldAlert size={13} style={{ color: '#34d399' }} /> Source Control</h3>
          <p style={{ fontSize: '13px', color: theme.textSecondary, lineHeight: 1.65, margin: 0 }}>{disease.source_control}</p>
        </div>
      )}

      {((disease.primary_therapy?.length || 0) + (disease.alternative_therapy?.length || 0)) > 0 && (
        <div>
          <h2 style={{ fontSize: '11px', fontWeight: 900, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Treatment Options</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {disease.primary_therapy?.map((tx, idx) => (
              <TherapyCard key={`p-${idx}`} tx={tx} type="First Line" idx={idx} onSelectDrug={onSelectDrug} theme={theme} />
            ))}
            {disease.alternative_therapy?.map((tx, idx) => (
              <TherapyCard key={`a-${idx}`} tx={tx} type={tx.condition || 'Alternative'} isAlt idx={idx + (disease.primary_therapy?.length || 0)} onSelectDrug={onSelectDrug} theme={theme} />
            ))}
          </div>
        </div>
      )}

      {disease.comments && (
        <div style={{ ...card(theme), padding: '18px', background: dark ? 'rgba(14,165,233,0.05)' : 'rgba(6,182,212,0.06)', borderColor: 'rgba(6,182,212,0.2)' }}>
          <h3 style={{ fontSize: '11px', fontWeight: 900, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}><BookOpen size={13} style={{ color: '#38bdf8' }} /> Comments &amp; Duration</h3>
          <p style={{ fontSize: '13px', color: theme.textSecondary, lineHeight: 1.7, margin: 0 }}>{disease.comments}</p>
        </div>
      )}
    </div>
  );
}

function TherapyCard({ tx, type, isAlt, idx, onSelectDrug, theme }) {
  const dark = theme === darkTheme;
  const accent = isAlt ? '#fbbf24' : '#34d399';
  const bg = isAlt
    ? (dark ? 'rgba(245,158,11,0.06)' : 'rgba(245,158,11,0.07)')
    : (dark ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.07)');
  const border = isAlt ? 'rgba(245,158,11,0.22)' : 'rgba(16,185,129,0.22)';

  return (
    <div style={{ borderRadius: '16px', padding: '16px', background: bg, border: `1px solid ${border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: accent, display: 'inline-block', flexShrink: 0 }} />
        <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', background: `${accent}20`, border: `1px solid ${accent}40`, color: accent }}>{type}</span>
      </div>
      <div style={{ padding: '14px', borderRadius: '12px', background: dark ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.7)', border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(6,182,212,0.15)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginBottom: '10px' }}>
          {tx.drugs.map(drugName => {
            const found = Object.entries(data.antibiotics).find(([, v]) => v.name.toLowerCase().includes(drugName.toLowerCase()));
            const id = found ? found[0] : null;
            return (
              <button key={drugName} onClick={() => id && onSelectDrug(id)} style={{
                display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 11px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, transition: 'all 0.2s',
                background: id ? (dark ? 'rgba(255,255,255,0.1)' : 'rgba(6,182,212,0.1)') : (dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                border: id ? `1px solid ${dark ? 'rgba(255,255,255,0.15)' : 'rgba(6,182,212,0.3)'}` : '1px solid transparent',
                color: id ? (dark ? '#ffffff' : '#0369a1') : theme.textSecondary, cursor: id ? 'pointer' : 'default',
              }}
                onMouseEnter={e => { if (id) { e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.18)' : 'rgba(6,182,212,0.2)'; e.currentTarget.style.transform = 'scale(1.04)'; } }}
                onMouseLeave={e => { if (id) { e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.1)' : 'rgba(6,182,212,0.1)'; e.currentTarget.style.transform = ''; } }}>
                <Pill size={13} style={{ color: id ? '#a78bfa' : theme.textMuted }} />
                {drugName}
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(6,182,212,0.07)', padding: '10px 12px', borderRadius: '9px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: accent, marginTop: '6px', flexShrink: 0 }} />
          <p style={{ fontSize: '13px', color: theme.textSecondary, fontWeight: 500, lineHeight: 1.65, margin: 0 }}>{tx.dose}</p>
        </div>
        {tx.adjunct && (
          <div style={{ marginTop: '10px', padding: '10px 12px', borderRadius: '9px', background: dark ? 'rgba(6,182,212,0.06)' : 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', display: 'flex', alignItems: 'flex-start', gap: '7px' }}>
            <AlertTriangle size={14} style={{ color: '#22d3ee', flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: '12px', color: theme.textSecondary, lineHeight: 1.6, margin: 0 }}><span style={{ color: '#22d3ee', fontWeight: 700 }}>Note: </span>{tx.adjunct}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DRUG MONOGRAPH
═══════════════════════════════════════════════════════════ */
function DrugMonograph({ drugId, theme }) {
  const drug = data.antibiotics[drugId];
  if (!drug) return null;
  const dark = theme === darkTheme;

  const sections = [
    { key: 'contraindications',   title: 'Contraindications',     icon: ShieldAlert,    color: '#f87171', bg: 'rgba(248,113,113,0.07)',  border: 'rgba(248,113,113,0.2)'  },
    { key: 'pregnancy_lactation', title: 'Pregnancy & Lactation', icon: Baby,           color: '#f9a8d4', bg: 'rgba(249,168,212,0.07)', border: 'rgba(249,168,212,0.2)' },
    { key: 'renal_impairment',    title: 'Renal Impairment',      icon: Droplets,       color: '#38bdf8', bg: 'rgba(56,189,248,0.07)',  border: 'rgba(56,189,248,0.2)'  },
    { key: 'hepatic_impairment',  title: 'Hepatic Impairment',    icon: AlertTriangle,  color: '#fbbf24', bg: 'rgba(251,191,36,0.07)', border: 'rgba(251,191,36,0.2)'  },
  ];

  return (
    <div className="animate-slide-in-right" style={{ maxWidth: '760px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ ...card(theme), padding: '22px', background: dark ? 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(99,102,241,0.08) 100%)' : 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(99,102,241,0.06) 100%)', borderColor: 'rgba(139,92,246,0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 8px 24px rgba(139,92,246,0.35)' }}>
            <Pill size={24} color="white" />
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a78bfa', margin: '0 0 4px' }}>Drug Monograph · SLCM 2024</p>
            <h1 style={{ fontSize: '20px', fontWeight: 900, color: theme.textPrimary, margin: 0, lineHeight: 1.2 }}>{drug.name}</h1>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {sections.map(({ key, title, icon: Icon, color, bg, border }) => {
          const val = drug[key];
          if (!val) return null;
          return (
            <div key={key} style={{ borderRadius: '16px', overflow: 'hidden', background: bg, border: `1px solid ${border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderBottom: `1px solid ${border}` }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={14} style={{ color }} />
                </div>
                <h3 style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color, margin: 0 }}>{title}</h3>
              </div>
              <div style={{ padding: '14px 16px' }}>
                {Array.isArray(val) ? (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {val.map((item, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: theme.textSecondary, lineHeight: 1.6 }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, marginTop: '6px', flexShrink: 0 }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontSize: '13px', color: theme.textSecondary, lineHeight: 1.65, margin: 0 }}>{val}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
