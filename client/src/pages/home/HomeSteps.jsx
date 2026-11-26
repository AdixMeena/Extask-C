import HandUnderline from '../../components/motion/HandUnderline.jsx';
import Reveal from '../../components/motion/Reveal.jsx';

const STEPS = [
  { n: '01', title: 'Post what you need',
    text: "Write it like you would tell a neighbour. “Fix a leaking tap in Indore” is a complete task. Add a budget and a place, and skip the categories." },
  { n: '02', title: 'Read the bids',
    text: 'Real people reply with a price and the time they can come. Compare ratings, the Verified badge and their own words, not just the number.' },
  { n: '03', title: 'Pick one. Rate each other.',
    text: 'Choose your person and the other bids close by themselves. When the work is done, you both leave a rating, so the next stranger can trust you.' },
];

// Deliberately uneven: each step sits further right than the last, like notes pinned by different hands.
export default function HomeSteps() {
  return (
    <section className="section section--tint">
      <div className="container">
        <Reveal as="h2" className="steps__title">
          Three steps. <HandUnderline>No</HandUnderline> middle company.
        </Reveal>
        <ol className="steps">
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.n} delay={i * 0.08} className="step">
              <span className="step__n" aria-hidden="true">{s.n}</span>
              <div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
