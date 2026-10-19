import { useMemo, useState } from 'react';
import { Clock3, MapPin, Menu, Phone, Plus, Search, X } from 'lucide-react';
import './Branches.css';
import { Link, useNavigate } from 'react-router-dom';
import { branches } from './BranchesData';

export function Branches() {
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const filteredBranches = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return branches;
    return branches.filter(branch => `${branch.name} ${branch.address}`.toLowerCase().includes(normalizedQuery));
  }, [query]);

  return <main className="wecare-branches">
      <header className="branches-header">
        <Link className="branches-brand" to="/" aria-label="WeCare Clinic home">
          <span className="branches-logo" aria-hidden="true"><Plus size={24} strokeWidth={2.8} /></span>
          <span>WeCare Clinic</span>
        </Link>
        <nav className={menuOpen ? 'branches-nav is-open' : 'branches-nav'} aria-label="Primary navigation">
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
          <Link className="active" to="/branches" onClick={() => setMenuOpen(false)}>Our Branches</Link>
          <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
        </nav>
        <button className="header-book-button" onClick={() => navigate('/book')}>Book an Appointment</button>
        <button className="mobile-menu-button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </header>

      <section className="branches-content" id="top" aria-labelledby="branches-title">
        <div className="branches-intro">
          <h1 id="branches-title">Our Clinic Branches</h1>
          <p>Select any WeCare branch below to schedule an in-person appointment.</p>
        </div>
        <label className="branch-search">
          <Search size={16} aria-hidden="true" />
          <span className="sr-only">Search branches</span>
          <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search branch by city, street, or district..." />
        </label>
        <div className="branch-grid" id="branches" aria-live="polite">
          {filteredBranches.map(branch => <article className="branch-card" key={branch.name}>
              <h2>{branch.name}</h2>
              <ul className="branch-details">
                <li><MapPin size={14} className="pin-icon" aria-hidden="true" /><span>{branch.address}</span></li>
                <li><Phone size={14} aria-hidden="true" /><span>{branch.phone}</span></li>
                <li><Clock3 size={14} aria-hidden="true" /><span>{branch.hours}</span></li>
              </ul>
              <button className="branch-book-button" onClick={() => navigate('/book', { state: { branch } })}>Book at This Branch</button>
            </article>)}
        </div>
        {filteredBranches.length === 0 && <p className="empty-results">No branches match that search. Try a city or district name.</p>}
      </section>
    </main>;
}