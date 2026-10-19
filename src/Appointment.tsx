import { Link, useNavigate } from 'react-router-dom';
import './index.css';
import { useState } from 'react';
import { ArrowRight, Clock3, MapPin, Menu, Phone, Plus, X } from 'lucide-react';
import { branches } from './BranchesData';
import { useAuth } from './AuthContext';

const steps = ['Select your preferred WeCare clinic branch', 'Pick an available appointment date and time slot', 'Enter contact details & receive instant email confirmation'];

export function Appointment() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return <main className="WeCare-site">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="WeCare Clinic home">
          <span className="brand-mark" aria-hidden="true"><Plus size={25} strokeWidth={2.7} /></span>
          <span>WeCare Clinic</span>
        </a>
        <nav className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Primary navigation">
          <a className="active" href="#top" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
          <Link to="/branches" onClick={() => setMenuOpen(false)}>Our Branches</Link>
          <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
        </nav>
        <div className="header-actions">
          <button className="text-action" onClick={user ? logout : () => navigate('/login')}>{user ? 'Log Out' : 'Log In'}</button>
          {!user && <button className="register-action" onClick={() => navigate('/register')}>Register</button>}
          <button className="primary-button header-button" onClick={() => navigate('/book')}>Book an Appointment</button>
        </div>
        <button className="menu-toggle" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <span className="eyebrow">MULTI-BRANCH HEALTHCARE</span>
          <h1><span>Modern, Accessible Care</span> <strong>Across All Our Clinic Branches</strong></h1>
          <p>Log in or register to book your clinic visit online.</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => navigate('/book')}>Book an Appointment</button>
            <Link className="secondary-button" to="/branches">View Locations</Link>
          </div>
        </div>
        <aside className="booking-guide" aria-labelledby="booking-guide-title">
          <h2 id="booking-guide-title">How Online Booking Works</h2>
          <ol>
            {steps.map((step, index) => <li key={step}><span className="step-number">{index + 1}</span><span>{step}</span></li>)}
          </ol>
        </aside>
      </section>

      <section className="branches-section" id="branches" aria-labelledby="branches-title">
        <div className="section-heading">
          <div>
            <h2 id="branches-title">Our Clinic Branches</h2>
            <p>Choose a convenient location near you for general consultations and routine check-ups.</p>
          </div>
          <Link className="all-branches" to="/branches">See All Branches <ArrowRight size={15} /></Link>
        </div>
        <div className="branch-grid">
          {branches.slice(0, 3).map(branch => <article className="branch-card" key={branch.name}>
              <h3>{branch.name}</h3>
              <ul>
                <li><MapPin size={14} className="detail-icon pin" /><span>{branch.address}</span></li>
                <li><Phone size={14} className="detail-icon" /><span>{branch.phone}</span></li>
                <li><Clock3 size={14} className="detail-icon" /><span>{branch.hours}</span></li>
              </ul>
              <button className="branch-button" onClick={() => navigate('/book', { state: { branch } })}>Book at This Branch</button>
            </article>)}
        </div>
      </section>

      <footer className="site-footer" id="contact">
        <div>
          <h2>WeCare Multi-Branch Clinic</h2>
          <p>Centralized Patient Appointment &amp; Outpatient Scheduling Network</p>
          <small>© 2026 WeCare Clinic Organization. All rights reserved.</small>
        </div>
        <div className="footer-right">
          <p><a href="#top">Home</a><span> • </span><Link to="/branches">Our Branches</Link><span> • </span><a href="#staff">Staff Portal</a></p>
          <p>Support Hotline: 0997-297-3652 | wecare.mdc@yahoo.com</p>
        </div>
      </footer>
    </main>;
}