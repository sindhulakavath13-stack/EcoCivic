import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { loginUser, registerUser } from '../services/api';
import { X, Lock, Mail, User, ShieldCheck, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, initialMode = 'login', onLoginSuccess }) {
  const { login } = useAuth();
  const { success, error } = useToast();

  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'register') {
        if (password !== confirmPassword) {
          error('Passwords do not match');
          setLoading(false);
          return;
        }

        const registered = await registerUser({ name, email, password });
        success('Registration successful! Logging you in...');
        
        // Auto login after register
        const loginData = await loginUser(email, password);
        login(loginData);
        onClose();
        if (onLoginSuccess) onLoginSuccess(loginData);
      } else {
        // Login mode
        const data = await loginUser(email, password);

        if (isAdminMode && data.role !== 'admin') {
          error('Access Denied: This account does not possess municipal administrator privileges.');
          setLoading(false);
          return;
        }

        login(data);
        success(`Welcome back, ${data.name || 'Citizen'}!`);
        onClose();
        if (onLoginSuccess) onLoginSuccess(data);
      }
    } catch (err) {
      console.error('Auth error:', err);
      error(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCitizen = () => {
    setIsAdminMode(false);
    setEmail('citizen@ecocivic.org');
    setPassword('citizen123');
  };

  const setDemoAdmin = () => {
    setIsAdminMode(true);
    setEmail('admin@ecocivic.org');
    setPassword('admin123');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '440px', padding: '32px' }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: 4
          }}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: 'var(--radius-lg)',
            background: isAdminMode 
              ? 'linear-gradient(135deg, #f43f5e 0%, #f59e0b 100%)' 
              : 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: 'var(--shadow-glow)',
            marginBottom: '12px'
          }}>
            {isAdminMode ? <ShieldCheck size={28} /> : <Sparkles size={26} />}
          </div>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '6px' }}>
            {mode === 'login' ? (isAdminMode ? 'Admin Portal Access' : 'Sign In to EcoCivic') : 'Create Citizen Account'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            {mode === 'login'
              ? (isAdminMode ? 'Enter administrative credentials to oversee civic issues' : 'Track complaints, get AI insights, and protect our environment')
              : 'Join thousands of citizens improving community sustainability'}
          </p>
        </div>

        {/* Role & Mode Switchers */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-surface)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '20px',
          border: '1px solid var(--border-color)'
        }}>
          <button
            type="button"
            onClick={() => { setMode('login'); setIsAdminMode(false); }}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.86rem',
              fontWeight: 600,
              background: mode === 'login' && !isAdminMode ? 'var(--bg-card-solid)' : 'transparent',
              color: mode === 'login' && !isAdminMode ? 'var(--text-main)' : 'var(--text-muted)',
              boxShadow: mode === 'login' && !isAdminMode ? 'var(--shadow-sm)' : 'none',
              transition: 'all var(--transition-fast)'
            }}
          >
            Citizen Login
          </button>
          <button
            type="button"
            onClick={() => { setMode('login'); setIsAdminMode(true); }}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.86rem',
              fontWeight: 600,
              background: mode === 'login' && isAdminMode ? 'var(--bg-card-solid)' : 'transparent',
              color: mode === 'login' && isAdminMode ? 'var(--priority-high)' : 'var(--text-muted)',
              boxShadow: mode === 'login' && isAdminMode ? 'var(--shadow-sm)' : 'none',
              transition: 'all var(--transition-fast)'
            }}
          >
            Admin Portal
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setIsAdminMode(false); }}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.86rem',
              fontWeight: 600,
              background: mode === 'register' ? 'var(--bg-card-solid)' : 'transparent',
              color: mode === 'register' ? 'var(--text-main)' : 'var(--text-muted)',
              boxShadow: mode === 'register' ? 'var(--shadow-sm)' : 'none',
              transition: 'all var(--transition-fast)'
            }}
          >
            Register
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                  placeholder="e.g. Maya Chen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <User size={18} color="var(--text-subtle)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">{isAdminMode ? 'Administrator Email' : 'Email Address'}</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: '40px' }}
                placeholder={isAdminMode ? 'admin@ecocivic.org' : 'name@example.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail size={18} color="var(--text-subtle)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: '40px', paddingRight: '40px' }}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock size={18} color="var(--text-subtle)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-subtle)',
                  cursor: 'pointer',
                  padding: 4
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <Lock size={18} color="var(--text-subtle)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>
          )}

          <button
            type="submit"
            className={isAdminMode ? 'btn btn-accent' : 'btn btn-primary'}
            style={{ width: '100%', marginTop: '12px', padding: '12px' }}
            disabled={loading}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {mode === 'login' ? (isAdminMode ? 'Enter Admin Dashboard' : 'Sign In') : 'Create Account'}
                <ArrowRight size={18} />
              </span>
            )}
          </button>
        </form>

        {/* Demo Fast Prefill */}
        <div style={{
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Quick Demo Autofill:
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ flex: 1, fontSize: '0.76rem' }}
              onClick={setDemoCitizen}
            >
              Citizen Account
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ flex: 1, fontSize: '0.76rem', color: 'var(--priority-high)' }}
              onClick={setDemoAdmin}
            >
              Admin Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
