import { useState } from 'react';
import useAuthStore from '../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alert, setAlert] = useState(null);
  const { login, loading, error } = useAuthStore();

  const navigate = useNavigate();

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => navigate('/'), 1500);
    } else {
      showAlert('error', result.error);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      showAlert('error', 'Please enter your email to reset password');
      return;
    }

    try {
      await axios.post('http://localhost:8000/api/v1/users/forgotPassword', {
        email,
      });
      showAlert('success', 'Password reset link sent to your email!');
    } catch (err) {
      console.log(err)
      showAlert('error', 'Failed to send reset link');
    }
  };

  return (
    <main className="main">
      {alert && (
        <div className={`alert alert--${alert.type}`}>{alert.message}</div>
      )}

      <div className="login-form">
        <h2 className="heading-secondary ma-bt-lg">Log into your account</h2>
        <form className="form form--login" onSubmit={handleSubmit}>
          <div className="form__group">
            <label className="form__label" htmlFor="email">Email address</label>
            <input
              className="form__input"
              id="email"
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form__group ma-bt-md">
            <label className="form__label" htmlFor="password">Password</label>
            <input
              className="form__input"
              id="password"
              type="password"
              placeholder="••••••••"
              required
              minLength="8"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="form__group">
            <button className="btn btn--green" disabled={loading}>
              {loading ? 'Logging In...' : 'Login'}
            </button>
          </div>

          {error && <div className="error">{error}</div>}

          <div className="form__group ma-t-md">
            <p className="form__text">
              Forgot your password?{' '}
              <button
                type="button"
                className="btn-text"
                onClick={handleForgotPassword}
              >
                Reset here
              </button>
            </p>
          </div>
        </form>
      </div>
    </main>
  );
};

export default Login;
