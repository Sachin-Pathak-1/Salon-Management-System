import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import '.././harshal.css'

export function LoginPage({ setIsLoggedIn, setCurrentUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (!email || !password) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      if (!email.includes('@')) {
        setError('Please enter a valid email');
        setLoading(false);
        return;
      }

      // Mock login
      const userData = {
        name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
        email: email,
        avatar: '👤',
        joinDate: new Date().toLocaleDateString(),
        role: 'User'
      };

      setCurrentUser(userData);
      setIsLoggedIn(true);
      setLoading(false);
      navigate('/');
    }, 1000);
  };

  const handleDemoLogin = () => {
    const demoUser = {
      name: 'John Doe',
      email: 'john@example.com',
      avatar: '😊',
      joinDate: '2024-01-15',
      role: 'Premium User'
    };
    setCurrentUser(demoUser);
    setIsLoggedIn(true);
    navigate('/');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Sign in to your account to continue</p>
        </div>

        <div className="login-right">
          <div className="login-form-wrapper">
            <div className="login-header">
              <h2>Sign In</h2>
              <p>Access your ServiceHub account</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={loading}
                />
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input type="checkbox" />
                  Remember me
                </label>
                <a href="#forgot" className="forgot-link">Forgot password?</a>
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="divider">
              <span>OR</span>
            </div>

            <button className="btn-demo" onClick={handleDemoLogin}>
              Try Demo Account
            </button>

            <div className="signup-link">
              Don't have an account? <a href="#signup">Sign up here</a>
            </div>

            <div className="social-login">
              <button className="btn-social google">
                <span>🔵</span> Google
              </button>
              <button className="btn-social github">
                <span>⚫</span> GitHub
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
