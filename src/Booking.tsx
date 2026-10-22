import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Check, ChevronLeft, ChevronRight, Mail, ArrowLeft } from 'lucide-react';
import { branches } from './BranchesData';
import type { Branch } from './BranchesData';
import { useAuth } from './AuthContext';
import { addAppointment, updateAppointment, toDateKey } from './AppointmentsStore';

interface Details {
  fullName: string;
  email: string;
  phone: string;
  reason: string;
}

function buildMonthCells(month: Date) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const leadingBlanks = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells: (Date | null)[] = Array(leadingBlanks).fill(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, monthIndex, day));
  return cells;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
const timeSlots = [{
  label: '09:00 AM',
  state: 'unavailable'
}, {
  label: '10:00 AM',
  state: 'available'
}, {
  label: '11:00 AM',
  state: 'available'
}, {
  label: '01:30 PM',
  state: 'available'
}, {
  label: '02:30 PM',
  state: 'available'
}, {
  label: '04:00 PM',
  state: 'unavailable'
}];

function makeReference() {
  const code = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `WC-${new Date().getFullYear()}-${code}`;
}

export function Booking() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();
  const incomingState = location.state as { branch?: Branch; reschedule?: string } | null;
  const incomingBranch = incomingState?.branch;
  const rescheduleRef = incomingState?.reschedule;
  const today = new Date();
today.setHours(0, 0, 0, 0);
const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
const lastMonth = new Date(today.getFullYear(), today.getMonth() + 6, 1);

  const [step, setStep] = useState(incomingBranch ? 2 : 1);
  const [selectedBranch, setSelectedBranch] = useState<Branch>(incomingBranch ?? branches[0]);
const [viewMonth, setViewMonth] = useState(thisMonth);
const [selectedDate, setSelectedDate] = useState(today);
const [selectedSlot, setSelectedSlot] = useState('');
const [reference, setReference] = useState('');
  const [details, setDetails] = useState<Details>({
    fullName: user?.name ?? '',
    email: user?.email ?? '',
    phone: '',
    reason: ''
  });

  const updateDetail = (field: keyof Details, value: string) => setDetails(current => ({ ...current, [field]: value }));

const longDate = selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
const shortDate = selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
const monthLabel = viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
const cells = buildMonthCells(viewMonth);
const changeMonth = (offset: number) => setViewMonth(current => new Date(current.getFullYear(), current.getMonth() + offset, 1));

  const progress = step === 1 ? 25 : step === 2 ? 50 : step === 3 ? 75 : 100;
  const goBack = () => setStep(current => Math.max(1, current - 1));
  const goForward = () => setStep(current => Math.min(5, current + 1));
  const confirmBooking = () => {
  const newReference = makeReference();
  if (rescheduleRef) updateAppointment(rescheduleRef, { status: 'Cancelled' });
  addAppointment({
    reference: newReference,
    email: user?.email ?? details.email,
    branchName: selectedBranch.name,
    branchAddress: selectedBranch.address,
    branchPhone: selectedBranch.phone,
    dateKey: toDateKey(selectedDate),
    slot: selectedSlot,
    fullName: details.fullName,
    phone: details.phone,
    reason: details.reason,
    status: 'Confirmed'
  });
  setReference(newReference);
  goForward();
};

  return <main className="booking-page">
      <section className="booking-card" aria-label="WeCare appointment booking">
        {step < 5 ? <>
            <header className="wizard-header">
              <div className="wizard-meta">
                <span>Step {step} of 4: {step === 1 ? 'Select Clinic Branch' : step === 2 ? 'Date & Time' : step === 3 ? 'Patient Details' : 'Review & Confirm'}</span>
                <span>{progress}% Complete</span>
              </div>
              <div className="progress-track" aria-label={`${progress}% complete`}><span style={{
              width: `${progress}%`
            }} /></div>
            </header>

            {step === 1 && <section className="wizard-section" aria-labelledby="branch-heading">
                <h1 id="branch-heading">Choose a Clinic Branch</h1>
                <p className="section-subtitle">Select the WeCare location where you want to be seen.</p>
                <div className="branch-options" role="radiogroup" aria-label="Clinic branches">
                  {branches.map(branch => <button className={`branch-option ${selectedBranch.name === branch.name ? 'is-selected' : ''}`} key={branch.name} onClick={() => setSelectedBranch(branch)} role="radio" aria-checked={selectedBranch.name === branch.name}>
                      <span className="branch-option-copy"><strong>{branch.name}</strong><span>{branch.address} • {branch.phone}</span><span>{branch.hours}</span></span>
                      <span className="radio-mark" aria-hidden="true">{selectedBranch.name === branch.name && <Check size={12} strokeWidth={3} />}</span>
                    </button>)}
                </div>
                <button className="primary-button full-button" onClick={goForward}>Continue <span aria-hidden="true">→</span></button>
                <p className = "back"><Link to = "/dashboard"><ArrowLeft size={13} /> Return to Dashboard</Link></p>
              </section>}

            {step === 2 && <section className="wizard-section" aria-labelledby="datetime-heading">
                <h1 id="datetime-heading">Select Date &amp; Time Slot</h1>
                <p className="branch-label">Branch: <strong>{selectedBranch.name}</strong></p>
                <div className="calendar-shell">
                  <div className="calendar-heading"><button type="button" aria-label="Previous month" disabled={viewMonth <= thisMonth} onClick={() => changeMonth(-1)}><ChevronLeft size={15} /></button><strong>{monthLabel}</strong><button type="button" aria-label="Next month" disabled={viewMonth >= lastMonth} onClick={() => changeMonth(1)}><ChevronRight size={15} /></button></div>
                  <div className="week-row">{['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => <span key={day}>{day}</span>)}</div>
                  <div className="calendar-grid">{cells.map((date, index) => date === null ? <span className="calendar-date" key={`blank-${index}`} /> : <button type="button" key={date.toISOString()} disabled={date < today} className={isSameDay(date, selectedDate) ? 'calendar-date selected-date' : 'calendar-date'} onClick={() => setSelectedDate(date)}>{date.getDate()}</button>)}</div>
                </div>
                <div className="slots-heading"><strong>Available Slots for {shortDate}</strong></div>
                <div className="slots-grid">{timeSlots.map(slot => <button key={slot.label} disabled={slot.state === 'unavailable'} className={`time-slot ${slot.state} ${selectedSlot === slot.label ? 'is-active' : ''}`} onClick={() => setSelectedSlot(current => current === slot.label ? '' : slot.label)}>{selectedSlot === slot.label && <Check size={12} />}{slot.label}{slot.state === 'unavailable' && <small>Booked</small>}</button>)}</div>
                <div className="legend"><span><i className="legend-dot selected" />Selected</span><span><i className="legend-dot available" />Available</span><span><i className="legend-dot unavailable" />Unavailable</span></div>
                <div className="wizard-actions"><button className="secondary-button" onClick={goBack}><ArrowLeft size={13} /> Back</button><button className="primary-button" disabled = {!selectedSlot}onClick={goForward}>Continue <span aria-hidden="true">→</span></button></div>
              </section>}

            {step === 3 && <section className="wizard-section" aria-labelledby="details-heading">
                <h1 id="details-heading">Your Contact Information</h1>
                <form className="details-form" onSubmit={event => {
            event.preventDefault();
            goForward();
          }}>
                  <label>Full Name *<input required value={details.fullName} onChange={event => updateDetail('fullName', event.target.value)} placeholder="Your full name" /></label>
                  <label>Email Address * <small>(For confirmation link)</small><input type="email" required value={details.email} onChange={event => updateDetail('email', event.target.value)} placeholder="you@email.com" /></label>
                  <label>Contact Number *<input required type="tel" inputMode="numeric" pattern="[0-9]{10,11}" maxLength={11} value={details.phone} onChange={event => updateDetail('phone', event.target.value.replace(/\D/g, ''))} placeholder="09170000000" title="Enter 10 to 11 digits, numbers only" /></label>
                  <label>Reason for Appointment <small>(Optional)</small><textarea value={details.reason} onChange={event => updateDetail('reason', event.target.value)} placeholder="Tell us briefly why you are visiting" /></label>
                  <div className="wizard-actions"><button type="button" className="secondary-button" onClick={goBack}><ArrowLeft size={13} /> Back</button><button type="submit" className="primary-button">Continue <span aria-hidden="true">→</span></button></div>
                </form>
              </section>}

            {step === 4 && <section className="wizard-section" aria-labelledby="review-heading">
                <h1 id="review-heading">Review Your Appointment</h1>
                <p className="section-subtitle">Please verify all details below before confirming your booking.</p>
                <div className="summary-card">
                  <div><small>SELECTED CLINIC BRANCH</small><strong>{selectedBranch.name}</strong><span>{selectedBranch.address}</span></div>
                  <div><small>APPOINTMENT DATE &amp; TIME</small><strong className="teal-text">{longDate} at {selectedSlot}</strong></div>
                  <div><small>PATIENT DETAILS</small><strong>{details.fullName}</strong><span>{details.email} • {details.phone}</span></div>
                  <div><small>REASON FOR VISIT</small><span>{details.reason || 'No reason provided'}</span></div>
                </div>
                <div className="wizard-actions"><button className="secondary-button" onClick={goBack}><ArrowLeft size={13} /> Back</button><button className="primary-button" onClick={confirmBooking}><Check size={13} /> Confirm Appointment</button></div>
              </section>}
          </> : <section className="confirmation-section" aria-labelledby="confirmation-heading">
            <div className="success-icon"><Check size={31} strokeWidth={3} /></div>
            <h1 id="confirmation-heading">Your Appointment Is Confirmed</h1>
            <strong className="reference">Booking Reference: #{reference}</strong>
            <p className="confirmation-note"><Mail size={13} /> Confirmation details &amp; manage link sent to {details.email}</p>
            <div className="confirmation-divider" />
            <div className="confirmation-details">
              <div><small>CLINIC BRANCH &amp; ADDRESS</small><strong>{selectedBranch.name}</strong><span>{selectedBranch.address}</span></div>
              <div><small>DATE &amp; TIME</small><strong className="teal-text">{longDate} • {selectedSlot}</strong></div>
              <div><small>PATIENT CONTACT DETAILS</small><strong>{details.fullName}</strong><span>{details.email} • {details.phone}</span></div>
            </div>
            <div className="confirmation-actions"><button className="secondary-button" onClick={() => navigate(`/appointment/${reference}`)}>View Appointment</button><button className="primary-button" onClick={() => navigate('/dashboard')}>Back to Dashboard</button></div>
          </section>}
      </section>
      <style>{`
        :root { font-family: Inter, Arial, sans-serif; color: #172033; background: #f5f7fa; }
        * { box-sizing: border-box; }
        .booking-page { min-height: 100vh; width: 100%; display: flex; justify-content: center; align-items: center; padding: 34px 18px; background: #f5f7fa; }
        .booking-card { width: min(100%, 520px); padding: 28px 32px 30px; background: #fff; border: 1px solid #e1e7eb; border-radius: 10px; box-shadow: 0 16px 44px rgba(25, 44, 65, .10); }
        .wizard-header { margin-bottom: 18px; }
        .wizard-meta { display: flex; justify-content: space-between; gap: 12px; color: #0a4f87; font-size: 18px; font-weight: 800; }
        .wizard-meta span:last-child { color: #0a4f87; font-weight: 600; }
        .progress-track { height: 3px; margin-top: 11px; background: #dfe8eb; border-radius: 99px; overflow: hidden; }
        .progress-track span { display: block; height: 100%; background: #0f6fb8; border-radius: inherit; transition: width .25s ease; }
        .wizard-section h1, .confirmation-section h1 { margin: 0; font-size: 20px; line-height: 1.25; letter-spacing: -.3px; }
        .section-subtitle, .branch-label { margin: 4px 0 16px; color: #826964; font-size: 16px; line-height: 1.5; }
        .branch-label { color: #0f6fb8; margin-bottom: 10px; }
        .branch-label strong { font-weight: 700; }
        .branch-options { display: grid; gap: 8px; margin-bottom: 20px; }
        .branch-option { width: 100%; min-height: 70px; display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 11px 12px; text-align: left; border: 1px solid #d7e0e4; border-radius: 6px; background: #fff; color: #172033; cursor: pointer; transition: border-color .2s, background .2s; }
        .branch-option:hover, .branch-option.is-selected { border-color: #0f6fb8; background: #eef6fc; }
        .branch-option-copy { display: grid; gap: 4px; min-width: 0; color: #285385; font-size: 12px; line-height: 1.2; }
        .branch-option-copy strong { color: #172033; font-size: 16px; }
        .radio-mark { flex: 0 0 16px; width: 16px; height: 16px; display: grid; place-items: center; border: 1px solid #2091c2; border-radius: 50%; color: white; background: white; }
        .is-selected .radio-mark { border-color: #0f6fb8; background: #0f6fb8; }
        .primary-button, .secondary-button { min-height: 35px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 0 15px; border-radius: 5px; font-size: 12px; font-weight: 800; cursor: pointer; transition: transform .2s, background .2s, border-color .2s; }
        .primary-button { border: 1px solid #0f6fb8; color: #fff; background: #0f6fb8; }
        .primary-button:hover { background: #0a4f87; transform: translateY(-1px); }
        .secondary-button { border: 1px solid #d7e0e4; color: #235a94; background: #fff; }
        .secondary-button:hover { border-color: #0f6fb8; color: #0a4f87; }
        .full-button { width: 100%; }
        .wizard-actions { display: flex; justify-content: space-between; gap: 10px; margin-top: 20px; }
        .calendar-shell { padding: 11px 13px 12px; border: 1px solid #e5eaed; border-radius: 6px; background: #fbfcfd; }
        .calendar-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; color: #172033; font-size: 14px; }
        .calendar-heading button { display: grid; place-items: center; padding: 2px; border: 0; color: #637181; background: transparent; cursor: pointer; }
        .week-row, .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; }
        .week-row { margin-bottom: 5px; color: #697786; font-size: 16px; }
        .calendar-grid { row-gap: 5px; }
        .calendar-date { width: 30px; height: 30px; padding: 0; display: grid; place-items: center; justify-self: center; line-height: 1; color: #526170; font-size: 13px; border-radius: 50%; }
        .calendar-grid .calendar-date:not(:disabled):not(.selected-date):hover { background: #e6f6f3; color: #0a4f87; }
        .selected-date { color: #fff; font-weight: 800; background: #0f6fb8; }
        .slots-heading { margin: 15px 0 9px; color: #172033; font-size: 14px; }
        .slots-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 7px; }
        .calendar-date:disabled { color: #c3ccd3; cursor: not-allowed; }
        .calendar-heading button:disabled { opacity: .3; cursor: not-allowed; }
        .primary-button:disabled { opacity: .5; cursor: not-allowed; transform: none; }
        .time-slot { min-height: 27px; display: flex; align-items: center; justify-content: center; gap: 4px; border: 1px solid #0f6fb8; border-radius: 4px; color: #0a4f87; background: #fff; font-size: 9px; cursor: pointer; }
        .time-slot.selected, .time-slot.is-active { color: #fff; background: #0f6fb8; }
        .time-slot.unavailable { border-color: #e4e8eb; color: #a8b1b9; background: #f1f3f5; cursor: not-allowed; }
        .time-slot small { font-size: 10px; }
        .legend { display: flex; gap: 13px; margin-top: 11px; color: #74818c; font-size: 14px; }
        .legend span { display: inline-flex; align-items: center; gap: 4px; }
        .legend-dot { width: 7px; height: 7px; display: inline-block; border-radius: 1px; border: 1px solid #0f6fb8; }
        .legend-dot.selected { background: #0f6fb8; }.legend-dot.unavailable { border-color: #d5dce0; background: #e7ebed; }
        .guest-banner { display: flex; align-items: center; gap: 5px; padding: 7px 8px; margin-bottom: 14px; border-radius: 4px; color: #4c7880; background: #eef9f8; font-size: 14px; }
        .details-form { display: grid; gap: 10px; }
        .details-form label { display: grid; gap: 5px; color: #263444; font-size: 14px; font-weight: 700; }
        .details-form label small { color: #73808d; font-size: 12px; font-weight: 400; }
        input, textarea { width: 100%; border: 1px solid #dce4e8; border-radius: 5px; outline: none; color: #334153; background: #fff; font-size: 12px; }
        input { height: 31px; padding: 0 9px; } textarea { min-height: 57px; padding: 8px 9px; resize: vertical; font-family: inherit; }
        input:focus, textarea:focus { border-color: #0f6fb8; box-shadow: 0 0 0 2px rgba(13,155,138,.12); }
        .summary-card, .confirmation-details { display: grid; gap: 13px; padding: 13px; border: 1px solid #e3e8eb; border-radius: 6px; background: #f8fafb; }
        .summary-card div, .confirmation-details div { display: grid; gap: 4px; }
        .summary-card small, .confirmation-details small { color: #71808c; font-size: 12px; font-weight: 800; letter-spacing: .2px; }
        .summary-card strong, .summary-card span, .confirmation-details strong, .confirmation-details span { color: #344253; font-size: 14px; line-height: 1.3; }
        .teal-text { color: #414244 !important; }
        .confirmation-section { text-align: center; }
        .success-icon { width: 54px; height: 54px; display: grid; place-items: center; margin: 1px auto 14px; border-radius: 50%; color: #0f6fb8; background: #dcf8f0; }
        .confirmation-section h1 { font-size: 17px; }
        .reference { display: block; margin-top: 5px; color: #0f6fb8; font-size: 9px; }
        .confirmation-note { display: inline-flex; align-items: center; gap: 5px; margin: 13px 0 17px; padding: 5px 8px; border-radius: 4px; color: #0f6fb8; background: #eefaf7; font-size: 8px; }
        .confirmation-divider { height: 1px; margin-bottom: 16px; background: #e5eaed; }
        .confirmation-details { text-align: left; }
        .confirmation-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 18px; }
        @media (max-width: 480px) { .booking-page { padding: 18px 10px; align-items: flex-start; }.booking-card { padding: 22px 18px; margin-top: 4px; }.wizard-meta { font-size: 9px; }.branch-option-copy { font-size: 8px; }.slots-grid { gap: 5px; }.time-slot { font-size: 8px; }.legend { gap: 8px; } }
      `}</style>
    </main>;
}