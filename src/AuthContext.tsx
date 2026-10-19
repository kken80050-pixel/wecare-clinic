import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface StoredUser {
  name: string;
  email: string;
  password: string;
}

interface SessionUser {
  name: string;
  email: string;
}

interface AuthValue {
  user: SessionUser | null;
  register: (name: string, email: string, password: string) => string | null;
  login: (email: string, password: string) => string | null;
  logout: () => void;
}

const USERS_KEY = 'wecare-users';
const SESSION_KEY = 'wecare-session';

function readUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function readSession(): SessionUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(readSession);

  const startSession = (session: SessionUser) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
  };

  const register = (name: string, email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const users = readUsers();
    if (users.some(existing => existing.email === cleanEmail)) {
      return 'An account with this email already exists. Please log in instead.';
    }
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, { name: name.trim(), email: cleanEmail, password }]));
    startSession({ name: name.trim(), email: cleanEmail });
    return null;
  };

  const login = (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const match = readUsers().find(existing => existing.email === cleanEmail);
    if (!match) return 'No account found for this email. Please register first.';
    if (match.password !== password) return 'Incorrect password. Please try again.';
    startSession({ name: match.name, email: match.email });
    return null;
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, register, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}