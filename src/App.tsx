import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { RequireAuth } from './RequireAuth';
import { Appointment } from './Appointment';
import { Branches } from './Branches';
import { Booking } from './Booking';
import { Login } from './Login';
import { Register } from './Register';
import { Dashboard } from './Dashboard';
import { AppointmentDetails } from './AppointmentDetails';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Appointment />} />
          <Route path="/branches" element={<Branches />} />
          <Route path="/book" element={<RequireAuth><Booking /></RequireAuth>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/appointment/:reference" element={<RequireAuth><AppointmentDetails /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}