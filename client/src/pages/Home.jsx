import { motion, useReducedMotion } from 'framer-motion';
import { lazy } from 'react';
import { Link } from 'react-router-dom';
import HandUnderline from '../components/motion/HandUnderline.jsx';
import LazyOnView from '../components/motion/LazyOnView.jsx';
import ConnectDiagram from './home/ConnectDiagram.jsx';

// Below-the-fold sections: split into chunks and only loaded when scrolled near.
const HomeBoard = lazy(() => import('./home/HomeBoard.jsx'));
const HomeSteps = lazy(() => import('./home/HomeSteps.jsx'));
const HomeStats = lazy(() => import('./home/HomeStats.jsx'));
const HomeCta = lazy(() => import('./home/HomeCta.jsx'));

const HEADLINE = ['Post', 'any', 'task.', 'Let', 'people', 'nearby'];

export default function Home() {
  const reduce = useReducedMotion();
  return (
    <>
      <section className="hero container">
        <div className="hero__copy">
          <p className="eyebrow">India's first open task-bidding marketplace</p>
          <h1 className="hero__title" aria-label="Post any task. Let people nearby bid.">
            {HEADLINE.map((word, i) => (
              <span key={i} aria-hidden="true">
                <span className="word-mask">
                <motion.span
                  className="word"
                  initial={reduce ? false : { y: '110%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4, ease: 'easeOut', delay: 0.08 * i }}
                >
                  {word}
                </motion.span>
                </span>{' '}
              </span>
            ))}
            <span className="word-mask" aria-hidden="true">
              <motion.span
                className="word"
                initial={reduce ? false : { y: '110%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: 0.08 * HEADLINE.length }}
              >
                <HandUnderline delay={0.9}>bid.</HandUnderline>
              </motion.span>
            </span>
          </h1>
          <motion.p
            className="hero__lede"
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.7 }}
          >
            Somewhere near you, someone can fix a leaking tap in 20 minutes. Name your task and your budget,
            and real people send you their price. No fixed menu, no middle company.
          </motion.p>
          <motion.div
            className="hero__cta"
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.85 }}
          >
            <Link to="/post" className="btn btn--primary">Post a task</Link>
            <Link to="/tasks" className="btn">See what's on the board</Link>
          </motion.div>
        </div>
        <ConnectDiagram />
      </section>

      <LazyOnView minHeight={520}><HomeBoard /></LazyOnView>
      <LazyOnView minHeight={560}><HomeSteps /></LazyOnView>
      <LazyOnView minHeight={420}><HomeStats /></LazyOnView>
      <LazyOnView minHeight={300}><HomeCta /></LazyOnView>
    </>
  );
}
