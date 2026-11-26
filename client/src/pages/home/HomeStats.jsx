import CountUp from '../../components/motion/CountUp.jsx';
import Reveal from '../../components/motion/Reveal.jsx';

// Market numbers from the ExTask pitch deck.
export default function HomeStats() {
  return (
    <section className="section container">
      <Reveal as="h2">Why now</Reveal>
      <div className="stats">
        <Reveal className="stat stat--wide">
          <p className="stat__num"><CountUp to={24} suffix="M" /></p>
          <p>gig workers expected in India by 2030, up from 8 million in 2021. Almost all of them are on one narrow lane: food and grocery delivery.</p>
        </Reveal>
        <Reveal className="stat" delay={0.06}>
          <p className="stat__num"><CountUp to={800} suffix="M+" /></p>
          <p>smartphone users in India</p>
        </Reveal>
        <Reveal className="stat" delay={0.12}>
          <p className="stat__num"><CountUp to={40} suffix="%" /></p>
          <p>of gig workers still earn under ₹15,000 a month</p>
        </Reveal>
        <Reveal className="stat stat--wide" delay={0.18}>
          <p className="stat__num"><CountUp to={2.35} prefix="₹" decimals={2} /> <small>lakh crore</small></p>
          <p>projected gig contribution to India's GDP by 2030. Repair, tutoring, moving and errands still have no platform of their own.</p>
        </Reveal>
      </div>
      <p className="muted stats__source">Figures from the ExTask pitch deck.</p>
    </section>
  );
}
