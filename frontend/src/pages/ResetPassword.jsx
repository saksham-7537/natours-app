import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== passwordConfirm) {
      showAlert('error', 'Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await api.patch(
        `/users/resetPassword/${token}`,
        { password, passwordConfirm }
      );

      if (res.data.status === 'success') {
        showAlert('success', 'Password reset successfully!');
        setTimeout(() => navigate('/users/login'), 1500);
      }
    } catch (error) {
      console.error(error);
      showAlert(
        'error',
        error.response?.data?.message || 'Reset failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main">
      {alert && (
        <div className={`alert alert--${alert.type}`}>
          {alert.message}
        </div>
      )}

      <div className="login-form">
        <h2 className="heading-secondary ma-bt-lg">
          Reset your password
        </h2>

        <form className="form form--login" onSubmit={handleSubmit}>
          <div className="form__group">
            <label className="form__label" htmlFor="password">
              New Password
            </label>
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

          <div className="form__group ma-bt-md">
            <label
              className="form__label"
              htmlFor="passwordConfirm"
            >
              Confirm Password
            </label>
            <input
              className="form__input"
              id="passwordConfirm"
              type="password"
              placeholder="••••••••"
              required
              minLength="8"
              value={passwordConfirm}
              onChange={(e) =>
                setPasswordConfirm(e.target.value)
              }
            />
          </div>

          <div className="form__group">
            <button className="btn btn--green" disabled={loading}>
              {loading
                ? 'Resetting Password...'
                : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default ResetPassword;
