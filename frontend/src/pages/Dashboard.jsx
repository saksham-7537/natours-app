import { useState, useEffect } from 'react';
import axios from 'axios';
import useAuthStore from '../store/authStore';

const Dashboard = () => {
  const { user, checkAuth } = useAuthStore();

  // user profile states
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState('');
  const [message, setMessage] = useState(null);

  // update password states
  const [passwordData, setPasswordData] = useState({
    passwordCurrent: '',
    password: '',
    passwordConfirm: '',
  });
  const [passwordStatus, setPasswordStatus] = useState({
    loading: false,
    error: '',
    success: '',
  });

  // displaying the user photo
  useEffect(() => {
    if (photo) {
      const url = URL.createObjectURL(photo);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [photo]);

  // updating the user profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    const form = new FormData();
    form.append('name', name);
    form.append('email', email);
    if (photo) form.append('photo', photo);

    try {
      await axios.patch('http://localhost:8000/api/v1/users/updateMe', form, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage('✔ Profile updated!');
      checkAuth();
    } catch (err) {
      setMessage('✖ Error updating profile!');
      console.error(err);
    }
  };

  // updating the password
  const handleUpdatePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordStatus({ loading: true, error: '', success: '' });

    try {
      const res = await axios.patch(
        'http://localhost:8000/api/v1/users/updateMyPassword',
        passwordData,
        {
          withCredentials: true,
        }
      );

      if (res.data.status === 'success') {
        setPasswordStatus({
          loading: false,
          error: '',
          success: 'Password Updated Successfully',
        });
        setPasswordData({
          passwordCurrent: '',
          password: '',
          passwordConfirm: '',
        });
      }
    } catch (err) {
      console.log(err);
      setPasswordStatus({
        loading: false,
        error: err.response?.data?.message || 'Failed to update password',
        success: '',
      });
    }
  };

  return (
    <div className="user-view">
      <nav className="user-view__menu">
        <ul className="side-nav">
          <li className="side-nav--active">
            <a href="#">Settings</a>
          </li>
          <li>
            <a href="/my-tours">My bookings</a>
          </li>
          <li>
            <a href="/logout">Logout</a>
          </li>
        </ul>
      </nav>

      <div className="user-view__content">
        <div className="user-view__form-container">
          {/* User Info Form */}
          <h2 className="heading-secondary ma-bt-md">Your account settings</h2>
          {message && <p className="form__error">{message}</p>}

          <form className="form form-user-data" onSubmit={handleSubmit}>
            <div className="form__group">
              <label className="form__label" htmlFor="name">
                Name
              </label>
              <input
                className="form__input"
                id="name"
                type="text"
                value={name}
                required
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form__group">
              <label className="form__label" htmlFor="email">
                Email address
              </label>
              <input
                className="form__input"
                id="email"
                type="email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form__group form__photo-upload">
              <img
                className="form__user-photo"
                src={
                  preview
                    ? preview
                    : user?.photo
                    ? `http://localhost:8000/img/users/${user.photo}`
                    : '/img/users/default.jpg'
                }
                alt="User"
              />
              <input
                className="form__upload"
                type="file"
                id="photo"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files[0])}
              />
              <label htmlFor="photo">Choose new photo</label>
            </div>

            <div className="form__group right">
              <button type="submit" className="btn btn--green">
                Save settings
              </button>
            </div>
          </form>

          {/* Password Change Form */}
          <h2
            className="heading-secondary ma-bt-md"
            style={{ marginTop: '4rem' }}
          >
            Password change
          </h2>

          {passwordStatus.success && (
            <p className="form__success">{passwordStatus.success}</p>
          )}
          {passwordStatus.error && (
            <p className="form__error">{passwordStatus.error}</p>
          )}

          <form
            className="form form-user-password"
            onSubmit={handleUpdatePasswordSubmit}
          >
            <div className="form__group">
              <label className="form__label" htmlFor="password-current">
                Current password
              </label>
              <input
                className="form__input"
                id="password-current"
                type="password"
                name="passwordCurrent"
                placeholder="••••••••"
                required
                value={passwordData.passwordCurrent}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    passwordCurrent: e.target.value,
                  })
                }
              />
            </div>

            <div className="form__group">
              <label className="form__label" htmlFor="password">
                New password
              </label>
              <input
                className="form__input"
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                required
                value={passwordData.password}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, password: e.target.value })
                }
              />
            </div>

            <div className="form__group">
              <label className="form__label" htmlFor="password-confirm">
                Confirm password
              </label>
              <input
                className="form__input"
                id="password-confirm"
                type="password"
                name="passwordConfirm"
                placeholder="••••••••"
                required
                value={passwordData.passwordConfirm}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    passwordConfirm: e.target.value,
                  })
                }
              />
            </div>

            <div className="form__group right">
              <button type="submit" className="btn btn--green">
                {passwordStatus.loading
                  ? 'Updating Password...'
                  : 'Save Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
