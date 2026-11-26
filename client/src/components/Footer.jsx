import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div>
          <p className="footer__brand">ExTask</p>
          <p className="footer__muted">India's first open task-bidding marketplace.</p>
        </div>
        <nav className="footer__links" aria-label="Footer">
          <Link to="/tasks">Browse tasks</Link>
          <Link to="/post">Post a task</Link>
          <Link to="/register">Join</Link>
        </nav>
        <p className="footer__muted footer__college">
          Minor Project-I · B.Tech CSE &amp; IT · Jawaharlal Institute of Technology, Borawan · 2026
        </p>
      </div>
    </footer>
  );
}
