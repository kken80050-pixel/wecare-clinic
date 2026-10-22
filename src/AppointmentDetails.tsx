import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { branches } from './BranchesData';
import { formatDay, getAppointment, statusOf, updateAppointment } from './AppointmentsStore';
import type { Appointment } from './AppointmentsStore';
import './Dashboard.css';

export function AppointmentDetails() {
  const { reference } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointment, setAppointment] = useState<Appointment | undefined>(() => (reference ? getAppointment(reference) : undefined));

  if (!appointment || appointment.email.toLowerCase() !== (user?.email ?? '').toLowerCase()) {
    return <Navigate to="/dashboard" replace />;
  }

  const status = statusOf(appointment);

  const cancel = () => {
    if (!window.confirm('Cancel this appointment?')) return;
    updateAppointment(appointment.reference, { status: 'Cancelled' });
    setAppointment(getAppointment(appointment.reference));
  };

  const reschedule = () => {
    const branch = branches.find(entry => entry.name === appointment.branchName);
    navigate('/book', { state: { branch, reschedule: appointment.reference } });
  };

  return <div className="wecare-dashboard wecare-details">
      <div className="dash-details-wrap">
        <Link to="/dashboard" className="dash-back">← Back to Patient Dashboard</Link>
        <section className="dash-details-card">
          <div className="dash-details-head">
            <h1>Appointment Details Summary</h1>
            <span className={`dash-badge ${status.toLowerCase()}`}>{status}</span>
          </div>
          <div className="dash-details-grid">
            <div><small>Booking Reference</small><strong className="dash-ref-large">#{appointment.reference}</strong></div>
            <div><small>Date &amp; Time</small><strong>{formatDay(appointment.dateKey, 'full')} • {appointment.slot}</strong></div>
          </div>
          <div className="dash-details-block">
            <small>Clinic Branch &amp; Full Address</small>
            <strong>{appointment.branchName}</strong>
            <span>{appointment.branchAddress} • Phone: {appointment.branchPhone}</span>
          </div>
          <div className="dash-details-block">
            <small>Patient Information</small>
            <strong>{appointment.fullName}</strong>
            <span>Email: {appointment.email} | Phone: {appointment.phone}</span>
            <span>Visit Notes: {appointment.reason || 'No reason provided'}</span>
          </div>
          {status === 'Confirmed' && <div className="dash-actions dash-details-actions">
              <button type="button" className="dash-primary" onClick={reschedule}>Reschedule Appointment</button>
              <button type="button" className="dash-danger" onClick={cancel}>Cancel Appointment</button>
            </div>}
        </section>
      </div>
    </div>;
}