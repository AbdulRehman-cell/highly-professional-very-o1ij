import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Card, Button, Input, Alert, Spinner } from '../components/ui';

export default function Login() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [infoMsg, setInfoMsg] = useState(null);

  useEffect(() => {
    async function checkCurrentSession() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (session?.user) {
          setUser(session.user);
        }
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        setCheckingAuth(false);
      }
    }

    checkCurrentSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data.user && data.session) {
          setInfoMsg('Account created successfully. Redirecting to Staff Dashboard...');
          setTimeout(() => {
            navigate('/admin');
          }, 1500);
        } else if (data.user && !data.session) {
          setInfoMsg('Staff account created. If email verification is enabled, please check your inbox before logging in.');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.session) {
          navigate('/admin');
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setInfoMsg('Signed out successfully.');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to sign out.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <section className="section login-section">
        <div className="container container-narrow text-center">
          <div className="login-loading-box">
            <Spinner size="lg" />
            <p className="login-loading-text">Verifying security credentials...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section login-section">
      <div className="container container-narrow">
        <div className="login-header">
          <span className="eyebrow">AMI HQ Security Gateway</span>
          <h1 className="login-title">Staff Operations Portal</h1>
          <p className="login-subtitle">
            Restricted access portal for authorized AMI product managers, inventory controllers, and logistics coordinators.
          </p>
        </div>

        <Card padding="lg" variant="bordered" className="login-card">
          {user ? (
            <div className="authenticated-view">
              <div className="status-badge-wrapper">
                <span className="badge badge-success">Session Active</span>
              </div>
              
              <h2 className="authenticated-heading">Welcome Back</h2>
              <p className="authenticated-user-email">{user.email}</p>
              
              <p className="authenticated-info-text">
                You are currently signed in with authenticated staff privileges. Access the management dashboard to process inventory, review gear submissions, or modify catalog listings.
              </p>

              {infoMsg && (
                <Alert variant="info" title="System Notice" className="login-alert">
                  {infoMsg}
                </Alert>
              )}

              {errorMsg && (
                <Alert variant="error" title="Action Failed" className="login-alert">
                  {errorMsg}
                </Alert>
              )}

              <div className="authenticated-actions">
                <Button 
                  variant="primary" 
                  onClick={() => navigate('/admin')}
                  className="full-width-btn"
                >
                  Enter Admin Dashboard
                </Button>
                
                <Button 
                  variant="ghost" 
                  onClick={handleSignOut}
                  disabled={loading}
                  className="full-width-btn"
                >
                  {loading ? <Spinner size="sm" /> : 'Sign Out'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="auth-form-wrapper">
              <div className="form-toggle-header">
                <h2 className="form-title">
                  {isSignUp ? 'Create Staff Account' : 'Staff Sign In'}
                </h2>
                <span className="form-access-notice">
                  Only email addresses pre-authorized on the internal staff roster will grant administrative privileges.
                </span>
              </div>

              {errorMsg && (
                <Alert variant="error" title="Authentication Error" className="login-alert">
                  {errorMsg}
                </Alert>
              )}

              {infoMsg && (
                <Alert variant="success" title="Success" className="login-alert">
                  {infoMsg}
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <Input
                    label="Corporate Email Address"
                    type="email"
                    name="email"
                    placeholder="name@amihockey.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <Input
                    label="Security Password"
                    type="password"
                    name="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-actions">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={loading}
                    className="full-width-btn submit-auth-btn"
                  >
                    {loading ? (
                      <Spinner size="sm" />
                    ) : isSignUp ? (
                      'Register Staff Credential'
                    ) : (
                      'Authenticate & Sign In'
                    )}
                  </Button>
                </div>
              </form>

              <div className="auth-mode-switch">
                <p className="switch-text">
                  {isSignUp ? 'Already registered on the staff list?' : 'First time authenticating your email?'}
                </p>
                <button
                  type="button"
                  className="switch-mode-btn"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setErrorMsg(null);
                    setInfoMsg(null);
                  }}
                >
                  {isSignUp ? 'Sign in with existing credentials' : 'Create your staff account'}
                </button>
              </div>

              <div className="public-return-link">
                <Link to="/" className="back-to-store-link">
                  ← Return to Store Front
                </Link>
              </div>
            </div>
          )}
        </Card>

        <div className="login-footer-notes">
          <p className="security-notice">
            <strong>Security Notice:</strong> Authorization tokens are monitored. Unauthorized access attempts to AMI operations software are logged with IP signatures.
          </p>
        </div>
      </div>
    </section>
  );
}