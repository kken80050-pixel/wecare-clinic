import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarDays, MapPin, Clock, Phone, Plus } from 'lucide-react';
import { useAuth } from './AuthContext';
import { branches } from './BranchesData';
import type { Branch } from './BranchesData';
import { fromDateKey, formatDay, getAppointmentsFor, statusOf, updateAppointment } from './AppointmentsStore';
import type { Appointment } from './AppointmentsStore';
import './Dashboard.css';

export function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const email = user?.email ?? '';
  const [appointments, setAppointments] = useState<Appointment[]>(() => getAppointmentsFor(email));
  const [view, setView] = useState<'appointments' | 'branches'>('appointments');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = appointments
    .filter(item => statusOf(item) === 'Confirmed' && fromDateKey(item.dateKey) >= today)
    .sort((a, b) => fromDateKey(a.dateKey).getTime() - fromDateKey(b.dateKey).getTime())[0];

  const history = appointments
    .filter(item => item !== upcoming)
    .sort((a, b) => fromDateKey(b.dateKey).getTime() - fromDateKey(a.dateKey).getTime());

  const cancel = (reference: string) => {
    if (!window.confirm('Cancel this appointment?')) return;
    updateAppointment(reference, { status: 'Cancelled' });
    setAppointments(getAppointmentsFor(email));
  };

  const reschedule = (item: Appointment) => {
    const branch = branches.find(entry => entry.name === item.branchName);
    navigate('/book', { state: { branch, reschedule: item.reference } });
  };

  const bookAt = (branch: Branch) => navigate('/book', { state: { branch } });

  const handleLogout = () => {
    navigate('/');
    logout();
  };

  return <div className="wecare-dashboard">
      <aside className="dash-sidebar">
        <a className="brand" href="#top" aria-label="WeCare Clinic home">
          <div className="dash-brand" aria-hidden="true"><Plus size={25} strokeWidth={2.7} /></div>
          <div>WeCare</div>
        </a>
        <nav className="dash-nav">
        <button type="button" className={view === 'appointments' ? 'active' : ''} onClick={() => setView('appointments')}><CalendarDays size={15} /> My Appointments</button>
        <button type="button" className={view === 'branches' ? 'active' : ''} onClick={() => setView('branches')}><MapPin size={15} /> Clinic Branches</button>
        </nav>
        <div className="dash-profile">
          <strong>Profile</strong>
          <span>Name: {user?.name}</span>
          <span>Email: {user?.email}</span>
          <button type="button" className="dash-logout" onClick={handleLogout}>Log Out</button>
        </div>
      </aside>

      <main className="dash-main">
        {view === 'appointments' ? <>
        <div className="dash-top">
          <h1>Welcome back, {user?.name}</h1>
          <button type="button" className="dash-primary" onClick={() => navigate('/book')}>+ Book Another Appointment</button>
        </div>
        

        {upcoming ? <section className="dash-upcoming">
            <div className="dash-upcoming-head">
              <h2>Upcoming Appointment</h2>
              <span className="dash-badge confirmed">Confirmed</span>
            </div>
            <p className="dash-ref">Ref #{upcoming.reference} • {formatDay(upcoming.dateKey, 'long')} at {upcoming.slot}</p>
            <p className="dash-branch">Branch: {upcoming.branchName}</p>
            <div className="dash-actions">
              <button type="button" className="dash-primary" onClick={() => navigate(`/appointment/${upcoming.reference}`)}>View Details</button>
              <button type="button" className="dash-outline" onClick={() => reschedule(upcoming)}>Reschedule</button>
              <button type="button" className="dash-danger" onClick={() => cancel(upcoming.reference)}>Cancel</button>
            </div>
          </section> : <section className="dash-upcoming dash-upcoming-empty">
            <h2>No upcoming appointment</h2>
            <p className="dash-branch">Book a visit at any WeCare branch to see it here.</p>
          </section>}

        <h2 className="dash-history-title">Appointment History</h2>
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr><th>Booking Ref</th><th>Clinic Branch</th><th>Date &amp; Time</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {history.length === 0 ? <tr><td colSpan={5} className="dash-empty">No appointments yet.</td></tr> : history.map(item => {
                const status = statusOf(item);
                return <tr key={item.reference}>
                    <td><strong>#{item.reference}</strong></td>
                    <td>{item.branchName}</td>
                    <td>{formatDay(item.dateKey, 'short')} • {item.slot}</td>
                    <td><span className={`dash-badge ${status.toLowerCase()}`}>{status}</span></td>
                    <td><Link to={`/appointment/${item.reference}`} className="dash-link">View Details</Link></td>
                  </tr>;
              })}
            </tbody>
          </table>
        </div>
        </> : <>
        <div className="dash-top">
        <h1>Clinic Branches</h1>
        </div>
        <div className="dash-branch-list">
         {branches.map(branch => <article className="dash-branch-card" key={branch.name}>
        <h3>{branch.name}</h3>
        <ul>
          <li><MapPin size={14} /> {branch.address}</li>
          <li><Phone size={14} /> {branch.phone}</li>
          <li><Clock size={14} /> {branch.hours}</li>
          </ul>
          <button type="button" className="dash-primary" onClick={() => bookAt(branch)}>Book at This Branch</button>
            </article>)}
           </div>
        </>}
      </main>
    </div>;
}