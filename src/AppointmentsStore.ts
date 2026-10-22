export type AppointmentStatus = 'Confirmed' | 'Completed' | 'Cancelled';

export interface Appointment {
  reference: string;
  email: string;
  branchName: string;
  branchAddress: string;
  branchPhone: string;
  dateKey: string;
  slot: string;
  fullName: string;
  phone: string;
  reason: string;
  status: AppointmentStatus;
}

const KEY = 'wecare-appointments';

function readAll(): Appointment[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Appointment[]) : [];
  } catch {
    return [];
  }
}

function writeAll(list: Appointment[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    return;
  }
}

export function getAppointmentsFor(email: string) {
  return readAll().filter(item => item.email.toLowerCase() === email.toLowerCase());
}

export function getAppointment(reference: string) {
  return readAll().find(item => item.reference === reference);
}

export function addAppointment(appointment: Appointment) {
  writeAll([...readAll(), appointment]);
}

export function updateAppointment(reference: string, changes: Partial<Appointment>) {
  writeAll(readAll().map(item => (item.reference === reference ? { ...item, ...changes } : item)));
}

export function toDateKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function fromDateKey(key: string) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatDay(key: string, style: 'short' | 'long' | 'full') {
  const date = fromDateKey(key);
  if (style === 'short') return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  if (style === 'long') return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export function statusOf(appointment: Appointment): AppointmentStatus {
  if (appointment.status !== 'Confirmed') return appointment.status;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return fromDateKey(appointment.dateKey) < today ? 'Completed' : 'Confirmed';
}

