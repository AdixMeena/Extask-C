import { Link } from 'react-router-dom';
import Reveal from '../../components/motion/Reveal.jsx';

export default function HomeCta() {
  return (
    <section className="cta">
      <Reveal className="container cta__inner">
        <div>
          <h2>Got a free evening and a useful skill?</h2>
          <p>Browse what people near you need and send a bid. Your first one takes about a minute, and ExTask charges no fee in this version.</p>
        </div>
        <Link to="/tasks" className="btn btn--primary">Find a task to bid on</Link>
      </Reveal>
    </section>
  );
}
