import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Store, Mail, Building2, Lock, ShieldCheck, Eye, EyeOff } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(false); // Default to registration
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); 
  const [confirmPassword, setConfirmPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordStrong = (pw: string) => {
    const minLength = pw.length >= 8;
    const hasUpper = /[A-Z]/.test(pw);
    const hasNumber = /[0-9]/.test(pw);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pw);
    return minLength && hasUpper && hasNumber && hasSpecial;
  };

  // Auto redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/business');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email is required');
      return;
    }

    if (isLogin) {
      // Basic login logic
      login(email);
    } else {
      // Registration logic
      if (!businessName) {
        setError('Business Name is required');
        return;
      }
      
      if (!isPasswordStrong(password)) {
        setError('Password must be at least 8 characters, include an uppercase letter, a number, and a special character.');
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      register({
        email,
        businessName
      });
    }
  };

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '12px', 
            background: 'var(--color-up)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white'
          }}>
            <Store size={28} />
          </div>
          <h1 style={{ fontSize: '2rem', margin: 0, letterSpacing: '-0.02em' }}>SupplyTrade</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          {isLogin ? 'Welcome back to your business terminal.' : 'Create an account to manage your supply chain.'}
        </p>
      </div>

      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <button 
            onClick={() => { setIsLogin(true); setError(''); }}
            style={{
              flex: 1,
              padding: '8px',
              background: 'none',
              border: 'none',
              borderBottom: isLogin ? '2px solid var(--text-primary)' : '2px solid transparent',
              color: isLogin ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {t('Login')}
          </button>
          <button 
            onClick={() => { setIsLogin(false); setError(''); }}
            style={{
              flex: 1,
              padding: '8px',
              background: 'none',
              border: 'none',
              borderBottom: !isLogin ? '2px solid var(--text-primary)' : '2px solid transparent',
              color: !isLogin ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {t('Sign Up')}
          </button>
        </div>

        {error && (
          <div style={{ background: 'var(--color-down)22', color: 'var(--color-down)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', textAlign: 'center', fontWeight: 'bold' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {!isLogin && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{t('Business Name')}</label>
                <div className="search-container" style={{ margin: 0 }}>
                  <Building2 size={16} className="search-icon" />
                  <input type="text" className="search-bar" value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="" />
                </div>
              </div>
            </>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{t('Email Address')}</label>
            <div className="search-container" style={{ margin: 0 }}>
              <Mail size={16} className="search-icon" />
              <input type="email" className="search-bar" value={email} onChange={e => setEmail(e.target.value)} placeholder="" />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{t('Password')}</label>
            <div className="search-container" style={{ margin: 0 }}>
              <Lock size={16} className="search-icon" />
              <input 
                type={showPassword ? "text" : "password"} 
                className="search-bar" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="" 
                style={{ paddingRight: '40px' }}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ 
                  position: 'absolute', 
                  right: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  color: 'var(--text-secondary)',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {!isLogin && password && !isPasswordStrong(password) && (
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', padding: '0 4px' }}>
                Must be 8+ chars, with uppercase, number, and symbol.
              </div>
            )}
          </div>

          {!isLogin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{t('Confirm Password')}</label>
              <div className="search-container" style={{ margin: 0 }}>
                <ShieldCheck size={16} className="search-icon" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="search-bar" 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)} 
                  placeholder="" 
                  style={{ paddingRight: '40px' }}
                />
              </div>
            </div>
          )}

          <button type="submit" className="buy-btn" style={{ marginTop: '16px' }}>
            {isLogin ? t('Sign In') : t('Create Account')}
          </button>
        </form>
      </div>
    </div>
  );
}
