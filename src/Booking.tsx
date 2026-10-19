import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, ChevronLeft, ChevronRight, Mail, ArrowLeft } from 'lucide-react';
import { branches } from './BranchesData';
import type { Branch } from './BranchesData';
import { useAuth } from './AuthContext';

interface Details {
  fullName: string;
  email: string;
  phone: string;
  reason: string;
}

const calendarRows = [['', '', '', '', '1', '2', '3'], ['4', '5', '6', '7', '8', '9', '10'], ['11', '12', '13', '14', '15', '16', '17'], ['18', '19', '20', '21', '22', '23', '24'], ['25', '26', '27', '28', '29', '30', '31']];
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

export function Booking() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();
  const incomingBranch = (location.state as { branch?: Branch } | null)?.branch;

  const [step, setStep] = useState(incomingBranch ? 2 : 1);
  const [selectedBranch, setSelectedBranch] = useState<Branch>(incomingBranch ?? branches[0]);
  const [selectedDate, setSelectedDate] = useState('21');
  const [selectedSlot, setSelectedSlot] = useState(' ');
  const [details, setDetails] = useState<Details>({
    fullName: user?.name ?? '',
    email: user?.email ?? '',
    phone: '',
    reason: ''
  });

  const updateDetail = (field: keyof Details, value: string) => setDetails(current => ({ ...current, [field]: value }));

  const pickedDate = new Date(2026, 9, Number(selectedDate));
  const longDate = pickedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const shortDate = pickedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  const progress = step === 1 ? 25 : step === 2 ? 50 : step === 3 ? 75 : 100;
  const goBack = () => setStep(current => Math.max(1, current - 1));
  const goForward = () => setStep(current => Math.min(5, current + 1));

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
              </section>}

            {step === 2 && <section className="wizard-section" aria-labelledby="datetime-heading">
                <h1 id="datetime-heading">Select Date &amp; Time Slot</h1>
                <p className="branch-label">Branch: <strong>{selectedBranch.name}</strong></p>
                <div className="calendar-shell">
                  <div className="calendar-heading"><button aria-label="Previous month"><ChevronLeft size={15} /></button><strong>October 2026</strong><button aria-label="Next month"><ChevronRight size={15} /></button></div>
                  <div className="week-row">{['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => <span key={day}>{day}</span>)}</div>
                  <div className="calendar-grid">{calendarRows.map((row, rowIndex) => row.map((date, dateIndex) => date === '' ? <span className="calendar-date" key={`${rowIndex}-${dateIndex}`} /> : <button type="button" className={date === selectedDate ? 'calendar-date selected-date' : 'calendar-date'} key={`${rowIndex}-${dateIndex}`} onClick={() => setSelectedDate(date)}>{date}</button>))}</div>
                </div>
                <div className="slots-heading"><strong>Available Slots for {shortDate}</strong></div>
                <div className="slots-grid">{timeSlots.map(slot => <button key={slot.label} disabled={slot.state === 'unavailable'} className={`time-slot ${slot.state} ${selectedSlot === slot.label ? 'is-active' : ''}`} onClick={() => setSelectedSlot(slot.label)}>{selectedSlot === slot.label && <Check size={12} />}{slot.label}{slot.state === 'unavailable' && <small>Booked</small>}</button>)}</div>
                <div className="legend"><span><i className="legend-dot selected" />Selected</span><span><i className="legend-dot available" />Available</span><span><i className="legend-dot unavailable" />Unavailable</span></div>
                <div className="wizard-actions"><button className="secondary-button" onClick={goBack}><ArrowLeft size={13} /> Back</button><button className="primary-button" onClick={goForward}>Continue <span aria-hidden="true">→</span></button></div>
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
                <div className="wizard-actions"><button className="secondary-button" onClick={goBack}><ArrowLeft size={13} /> Back</button><button className="primary-button" onClick={goForward}><Check size={13} /> Confirm Appointment</button></div>
              </section>}
          </> : <section className="confirmation-section" aria-labelledby="confirmation-heading">
            <div className="success-icon"><Check size={31} strokeWidth={3} /></div>
            <h1 id="confirmation-heading">Your Appointment Is Confirmed</h1>
            <strong className="reference">Booking Reference: #WC-2026-8492</strong>
            <p className="confirmation-note"><Mail size={13} /> Confirmation details &amp; manage link sent to {details.email}</p>
            <div className="confirmation-divider" />
            <div className="confirmation-details">
              <div><small>CLINIC BRANCH &amp; ADDRESS</small><strong>{selectedBranch.name}</strong><span>{selectedBranch.address}</span></div>
              <div><small>DATE &amp; TIME</small><strong className="teal-text">{longDate} • {selectedSlot}</strong></div>
              <div><small>PATIENT CONTACT DETAILS</small><strong>{details.fullName}</strong><span>{details.email} • {details.phone}</span></div>
            </div>
            <div className="confirmation-actions"><button className="primary-button" onClick={() => setStep(4)}>View Appointment</button><button className="secondary-button" onClick={() => navigate('/')}>Return Home</button></div>
          </section>}
      </section>
      <style>{`
        :root { font-family: Inter, Arial, sans-serif; color: #172033; background: #f5f7fa; }
        * { box-sizing: border-box; }
        .booking-page { min-height: 100vh; width: 100%; display: flex; justify-content: center; align-items: center; padding: 34px 18px; background: #f5f7fa; }
        .booking-card { width: min(100%, 520px); padding: 28px 32px 30px; background: #fff; border: 1px solid #e1e7eb; border-radius: 10px; box-shadow: 0 16px 44px rgba(25, 44, 65, .10); }
        .wizard-header { margin-bottom: 18px; }
        .wizard-meta { display: flex; justify-content: space-between; gap: 12px; color: #087f73; font-size: 10px; font-weight: 800; }
        .wizard-meta span:last-child { color: #526170; font-weight: 600; }
        .progress-track { height: 3px; margin-top: 11px; background: #dfe8eb; border-radius: 99px; overflow: hidden; }
        .progress-track span { display: block; height: 100%; background: #0d9b8a; border-radius: inherit; transition: width .25s ease; }
        .wizard-section h1, .confirmation-section h1 { margin: 0; font-size: 16px; line-height: 1.25; letter-spacing: -.3px; }
        .section-subtitle, .branch-label { margin: 4px 0 16px; color: #647282; font-size: 10px; line-height: 1.5; }
        .branch-label { color: #0d9b8a; margin-bottom: 10px; }
        .branch-label strong { font-weight: 700; }
        .branch-options { display: grid; gap: 8px; margin-bottom: 20px; }
        .branch-option { width: 100%; min-height: 70px; display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 11px 12px; text-align: left; border: 1px solid #d7e0e4; border-radius: 6px; background: #fff; color: #172033; cursor: pointer; transition: border-color .2s, background .2s; }
        .branch-option:hover, .branch-option.is-selected { border-color: #0d9b8a; background: #f0fbf9; }
        .branch-option-copy { display: grid; gap: 4px; min-width: 0; color: #596777; font-size: 9px; line-height: 1.2; }
        .branch-option-copy strong { color: #172033; font-size: 10px; }
        .radio-mark { flex: 0 0 16px; width: 16px; height: 16px; display: grid; place-items: center; border: 1px solid #c8d4d9; border-radius: 50%; color: white; background: white; }
        .is-selected .radio-mark { border-color: #0d9b8a; background: #0d9b8a; }
        .primary-button, .secondary-button { min-height: 35px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 0 15px; border-radius: 5px; font-size: 10px; font-weight: 800; cursor: pointer; transition: transform .2s, background .2s, border-color .2s; }
        .primary-button { border: 1px solid #0d9b8a; color: #fff; background: #0d9b8a; }
        .primary-button:hover { background: #087f73; transform: translateY(-1px); }
        .secondary-button { border: 1px solid #d7e0e4; color: #394858; background: #fff; }
        .secondary-button:hover { border-color: #0d9b8a; color: #087f73; }
        .full-button { width: 100%; }
        .wizard-actions { display: flex; justify-content: space-between; gap: 10px; margin-top: 20px; }
        .calendar-shell { padding: 11px 13px 12px; border: 1px solid #e5eaed; border-radius: 6px; background: #fbfcfd; }
        .calendar-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; color: #172033; font-size: 10px; }
        .calendar-heading button { display: grid; place-items: center; padding: 2px; border: 0; color: #637181; background: transparent; cursor: pointer; }
        .week-row, .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; }
        .week-row { margin-bottom: 5px; color: #697786; font-size: 8px; }
        .calendar-grid { row-gap: 5px; }
        .calendar-date { width: 19px; height: 19px; display: grid; place-items: center; justify-self: center; color: #73808d; font-size: 8px; }
        .selected-date { color: #fff; font-weight: 800; border-radius: 50%; background: #0d9b8a; }
        .slots-heading { margin: 15px 0 9px; color: #172033; font-size: 10px; }
        .slots-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 7px; }
        .time-slot { min-height: 27px; display: flex; align-items: center; justify-content: center; gap: 4px; border: 1px solid #0d9b8a; border-radius: 4px; color: #087f73; background: #fff; font-size: 9px; cursor: pointer; }
        .time-slot.selected, .time-slot.is-active { color: #fff; background: #0d9b8a; }
        .time-slot.unavailable { border-color: #e4e8eb; color: #a8b1b9; background: #f1f3f5; cursor: not-allowed; }
        .time-slot small { font-size: 7px; }
        .legend { display: flex; gap: 13px; margin-top: 11px; color: #74818c; font-size: 8px; }
        .legend span { display: inline-flex; align-items: center; gap: 4px; }
        .legend-dot { width: 7px; height: 7px; display: inline-block; border-radius: 1px; border: 1px solid #0d9b8a; }
        .legend-dot.selected { background: #0d9b8a; }.legend-dot.unavailable { border-color: #d5dce0; background: #e7ebed; }
        .guest-banner { display: flex; align-items: center; gap: 5px; padding: 7px 8px; margin-bottom: 14px; border-radius: 4px; color: #4c7880; background: #eef9f8; font-size: 8px; }
        .details-form { display: grid; gap: 10px; }
        .details-form label { display: grid; gap: 5px; color: #263444; font-size: 9px; font-weight: 700; }
        .details-form label small { color: #73808d; font-size: 8px; font-weight: 400; }
        input, textarea { width: 100%; border: 1px solid #dce4e8; border-radius: 5px; outline: none; color: #334153; background: #fff; font-size: 10px; }
        input { height: 31px; padding: 0 9px; } textarea { min-height: 57px; padding: 8px 9px; resize: vertical; font-family: inherit; }
        input:focus, textarea:focus { border-color: #0d9b8a; box-shadow: 0 0 0 2px rgba(13,155,138,.12); }
        .summary-card, .confirmation-details { display: grid; gap: 13px; padding: 13px; border: 1px solid #e3e8eb; border-radius: 6px; background: #f8fafb; }
        .summary-card div, .confirmation-details div { display: grid; gap: 4px; }
        .summary-card small, .confirmation-details small { color: #71808c; font-size: 7px; font-weight: 800; letter-spacing: .2px; }
        .summary-card strong, .summary-card span, .confirmation-details strong, .confirmation-details span { color: #344253; font-size: 9px; line-height: 1.3; }
        .teal-text { color: #0d9b8a !important; }
        .confirmation-section { text-align: center; }
        .success-icon { width: 54px; height: 54px; display: grid; place-items: center; margin: 1px auto 14px; border-radius: 50%; color: #0d9b8a; background: #dcf8f0; }
        .confirmation-section h1 { font-size: 17px; }
        .reference { display: block; margin-top: 5px; color: #0d9b8a; font-size: 9px; }
        .confirmation-note { display: inline-flex; align-items: center; gap: 5px; margin: 13px 0 17px; padding: 5px 8px; border-radius: 4px; color: #0d9b8a; background: #eefaf7; font-size: 8px; }
        .confirmation-divider { height: 1px; margin-bottom: 16px; background: #e5eaed; }
        .confirmation-details { text-align: left; }
        .confirmation-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 18px; }
        @media (max-width: 480px) { .booking-page { padding: 18px 10px; align-items: flex-start; }.booking-card { padding: 22px 18px; margin-top: 4px; }.wizard-meta { font-size: 9px; }.branch-option-copy { font-size: 8px; }.slots-grid { gap: 5px; }.time-slot { font-size: 8px; }.legend { gap: 8px; } }
      `}</style>
    </main>;
}