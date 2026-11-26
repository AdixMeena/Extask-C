import { motion } from 'framer-motion';
import { LogOut, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useScrollDirection } from '../hooks/useScrollDirection.js';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const scrolledDown = useScrollDirection();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [location.pathname]); // close the mobile menu after navigating

  const hidden = scrolledDown && !open; // never hide while the mobile menu is open
  const onLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.header
      className="nav"
      animate={{ y: hidden ? '-100%' : '0%' }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <div className="container nav__inner">
        <Link to="/" className="nav__logo" aria-label="ExTask home">
          <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">
            <circle cx="16" cy="12" r="8" fill="#FF6B35" stroke="#141B4D" strokeWidth="2" />
            <path d="M16 20v8" stroke="#141B4D" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <span>Ex<b>Task</b></span>
        </Link>

        <button
          className="nav__toggle"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="nav-links"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav id="nav-links" className={`nav__links ${open ? 'is-open' : ''}`} aria-label="Main">
          <NavLink to="/tasks">Browse tasks</NavLink>
          {user && <NavLink to="/my-tasks">My tasks</NavLink>}
          {user && <NavLink to="/my-bids">My bids</NavLink>}
          <Link to="/post" className="btn btn--primary btn--sm">
            Post a task
          </Link>
          {user ? (
            <>
              <NavLink to={`/profile/${user.id}`} className="nav__me">
                {user.name.split(' ')[0]}
              </NavLink>
              <button className="nav__logout" onClick={onLogout} aria-label="Log out" title="Log out">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Log in</NavLink>
              <NavLink to="/register">Join</NavLink>
            </>
          )}
        </nav>
      </div>
    </motion.header>
  );
}
