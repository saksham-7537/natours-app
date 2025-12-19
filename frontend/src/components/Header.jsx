import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuthStore();

  return (
    <header className="header">
      <div className="header__logo">
        <img src="/img/logo-white.png" alt="Natours logo" />
      </div>

      <nav className="nav nav--tours">
        <Link to="/" className="nav__el">
          All tours
        </Link>
      </nav>

      {user && isAuthenticated ? (
        <nav className="nav nav--user">
          <Link to="/dashboard" className="nav__el">
            <img
              src={
                user.photo
                  ? `${import.meta.env.VITE_API_URL}/img/users/${user.photo}`
                  : '/img/users/default.jpg'
              }
              alt={user.name}
              className="nav__user-img"
            />
            <span>{user.name.split(' ')[0]}</span>
          </Link>

          <button className="nav__el" onClick={logout}>
            Logout
          </button>
        </nav>
      ) : (
        <nav className="nav nav--user">
          <Link to="/users/login" className="nav__el">
            Log in
          </Link>
          <Link to="/users/signup" className="nav__el nav__el--cta">
            Sign up
          </Link>
        </nav>
      )}
    </header>
  );
};

export default Header;
