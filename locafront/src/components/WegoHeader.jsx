import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './styles/Navbar.css';

export default function WegoHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrollHeader, setScrollHeader] = useState(false);
  const closeBtnRef = useRef(null);
  const openerBtnRef = useRef(null);

  // Detect scroll for sticky style
  useEffect(() => {
    const handleScroll = () => setScrollHeader(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close on Esc key
  useEffect(() => {
    const onEsc = (e) => e.key === 'Escape' && setMobileOpen(false);
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, []);

  // Disable scroll when menu open
  useEffect(() => {
    document.body.classList.toggle('no-scroll', mobileOpen);
  }, [mobileOpen]);

  const closeMenu = () => setMobileOpen(false);

  return (
    <>
      <header className={`navbar ${scrollHeader ? 'navbar-scrolled' : ''}`}>
        <nav className="navbar-container">
          {/* ✅ Logo + Brand */}
          <div className="navbar-brand">
            <Link to="/" className="navbar-logo-link" onClick={closeMenu}>
              <img
                src="https://mediaon.ma/wp-content/uploads/2022/10/menu-logo.png"
                alt="WegoRent Logo"
                className="navbar-logo"
              />
            </Link>
            <Link to="/" className="navbar-title" onClick={closeMenu}>
            </Link>
          </div>

          {/* ✅ Desktop Menu */}
          <div className="navbar-links">
            <Link to="/about" className="navbar-link">À propos</Link>
            <Link to="/dashboard" className="navbar-btn" onClick={closeMenu}>
              Tableaux de bord
            </Link>
          </div>

          {/* ✅ Mobile Menu Button */}
          <button
            ref={openerBtnRef}
            className="navbar-toggle"
            aria-expanded={mobileOpen ? 'true' : 'false'}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff">
              <path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" />
            </svg>
          </button>
        </nav>

        {/* ✅ Mobile Menu */}
        {mobileOpen && (
          <div className="navbar-mobile" onClick={(e) => e.target === e.currentTarget && closeMenu()}>
            <div className="navbar-mobile-sheet">
              <div className="navbar-mobile-header">
                <h2>Menu</h2>
                <button ref={closeBtnRef} className="navbar-close" onClick={closeMenu}>✕</button>
              </div>
              <nav className="navbar-mobile-nav">
                <Link to="/about" onClick={closeMenu}>À propos</Link>
                <Link to="/dashboard" className="navbar-btn" onClick={closeMenu}>Tableaux de bord</Link>
              </nav>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

